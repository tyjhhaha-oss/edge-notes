'use client'

import { useState, useEffect } from 'react'

export default function ShareLink({ slug }) {
    const [copied, setCopied] = useState(false)
    const [shareUrl, setShareUrl] = useState('')

    useEffect(() => {
        // 在客户端生成完整 URL
        setShareUrl(`${window.location.origin}/share/${slug}`)
    }, [slug])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('复制失败:', err)
        }
    }

    if (!shareUrl) return null // 等待客户端挂载

    return (
        <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">公开分享链接</h3>
            <div className="flex gap-2">
                <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 bg-white text-sm text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                    onClick={copyToClipboard}
                    className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 w-24 justify-center transition-colors ${copied
                            ? 'border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
                        }`}
                >
                    {copied ? '已复制' : '复制'}
                </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
                任何人拥有此链接均可查看（无需登录）
            </p>
        </div>
    )
}
