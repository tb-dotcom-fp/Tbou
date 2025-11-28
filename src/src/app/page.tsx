import { LessonsClient } from '@/components/LessonsClient'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* العنوان الرئيسي */}
        <header className="text-center py-10">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-wider">
            T.BOU
          </h1>
          <p className="text-xl md:text-2xl text-yellow-300 mt-4 font-semibold">
            RSI ET IAIL
          </p>
        </header>

        <LessonsClient />
      </div>
    </div>
  )
}
