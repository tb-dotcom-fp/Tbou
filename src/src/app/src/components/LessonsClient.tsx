'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Upload, Trash2, Download, Lock, LogOut } from 'lucide-react'

const subjects = [
  "MTU", "ALGÈBRE", "PYTHON", "ALGORITHME",
  "ARCHITECTURE", "ÉLECTRONIQUE", "ANALYSE"
]

export function LessonsClient() {
  const [lessons, setLessons] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [password, setPassword] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchLessons = async () => {
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at', { ascending: false })
    setLessons(data || [])
  }

  useEffect(() => {
    fetchLessons()
    const admin = localStorage.getItem('tbou_admin')
    if (admin === 'true') setIsAdmin(true)
  }, [])

  const login = () => {
    if (password === 'T.B') {
      setIsAdmin(true)
      localStorage.setItem('tbou_admin', 'true')
      setPassword('')
    } else {
      alert('الكود غلط')
    }
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem('tbou_admin')
  }

  const uploadFile = async () => {
    if (!file || !selectedSubject) return alert('اختار المادة والملف أولاً')

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `\( {Date.now()}- \){Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('lessons')
      .upload(fileName, file)

    if (uploadError) {
      alert('فشل الرفع: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage
      .from('lessons')
      .getPublicUrl(fileName)

    await supabase.from('lessons').insert({
      title: file.name,
      subject: selectedSubject,
      file_url: urlData.publicUrl
    })

    fetchLessons()
    setFile(null)
    ;(document.getElementById('file-input') as HTMLInputElement).value = ''
    setUploading(false)
  }

  const deleteLesson = async (id: string, fileUrl: string) => {
    if (!confirm('متأكد تحذف الدرس؟')) return

    const fileName = fileUrl.split('/').pop()
    await supabase.storage.from('lessons').remove([fileName!])
    await supabase.from('lessons').delete().eq('id', id)
    fetchLessons()
  }

  // شاشة تسجيل الدخول للأدمن
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-10 max-w-md w-full">
          <Lock className="w-20 h-20 text-purple-600 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-center mb-8">لوحة تحكم T.BOU</h2>
          <input
            type="password"
            placeholder="ادخل الكود السري"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 rounded-xl border-2 border-purple-300 focus:border-purple-600 outline-none text-lg text-center"
            onKeyDown={(e) => e.key === 'Enter' && login()}
          />
          <button
            onClick={login}
            className="mt-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-5 rounded-xl text-xl"
          >
            دخول
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button onClick={logout} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl">
          <LogOut className="w-5 h-5" /> خروج
        </button>
      </div>

      {/* رفع ملف جديد */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-12">
        <h2 className="text-4xl font-bold text-white text-center mb-8">إضافة درس جديد</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-6 py-4 rounded-xl bg-white/20 text-white text-lg">
            <option value="">اختر المادة</option>
            {subjects.map(s => <option key={s} value={s} className="bg-purple-900">{s}</option>)}
          </select>

          <input id="file-input" type="file" accept=".pdf,.docx,.pptx,.zip"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="px-6 py-4 rounded-xl bg-white/20 text-white file:bg-purple-600 file:text-white file:rounded-xl file:py-3 file:px-6" />

          <button onClick={uploadFile} disabled={uploading}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3">
            <Upload className="w-6 h-6" />
            {uploading ? 'جاري الرفع...' : 'رفع الملف'}
          </button>
        </div>
      </div>

      {/* عرض الدروس */}
      {subjects.map(subject => {
        const subjectLessons = lessons.filter(l => l.subject === subject)
        if (subjectLessons.length === 0) return null

        return (
          <div key={subject} className="mb-12">
            <h2 className="text-4xl font-bold text-yellow-300 text-center bg-white/10 py-4 rounded-2xl mb-8">
              {subject}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectLessons.map(lesson => (
                <div key={lesson.id} className="bg-white/10 backdrop-blur rounded-2xl p-6 hover:scale-105 transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white truncate pr-4">{lesson.title}</h3>
                    <button onClick={() => deleteLesson(lesson.id, lesson.file_url)}
                      className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                  <a href={lesson.file_url} target="_blank" rel="noopener noreferrer"
                    className="block text-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl">
                    <Download className="inline w-5 h-5 mr-2" /> تحميل
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
        }
