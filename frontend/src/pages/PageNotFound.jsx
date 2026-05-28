import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function PageNotFound() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md rounded-3xl border border-gray-200 bg-white/90 dark:bg-slate-900/90 dark:border-slate-700 p-10 shadow-xl">
        <p className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{t('common.pageNotFound', 'Page not found')}</h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {t('common.pageNotFoundMessage', 'The page you are looking for does not exist.')}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {t('common.goHome', 'Go to dashboard')}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t('common.goBack', 'Go back')}
          </button>
        </div>
      </div>
    </div>
  )
}
