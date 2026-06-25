import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IonIcon } from '@ionic/react'
import {
  chevronBackOutline, sendOutline, sparklesOutline,
  personOutline, cashOutline, cardOutline, trendingUpOutline,
} from 'ionicons/icons'
import { aiApi } from '../../api/ai'

const SAMPLE_QUESTIONS = [
  { icon: cashOutline,       text: 'Can I afford to buy a car?' },
  { icon: trendingUpOutline, text: 'How much should I invest monthly?' },
  { icon: cardOutline,       text: 'Should I pay off my loans or invest?' },
  { icon: personOutline,     text: 'What is my financial health score?' },
]

function TypingDots() {
  return (
    <div className="ai-typing-dots">
      <span /><span /><span />
    </div>
  )
}

function AIMessage({ text }) {
  const parts = text.split('\n').filter((_, i, arr) => !(i === 0 && arr[0] === ''))
  return (
    <div className="ai-msg-block ai">
      <div className="ai-avatar-icon">
        <IonIcon icon={sparklesOutline} />
      </div>
      <div className="ai-bubble ai">
        {parts.map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} className="ai-line bold">{line.replace(/\*\*/g, '')}</p>
          }
          if (line.startsWith('• ') || line.startsWith('- ')) {
            return <p key={i} className="ai-line bullet">{line.replace(/^[•\-] /, '')}</p>
          }
          if (line === '') return <div key={i} className="ai-line-gap" />
          return <p key={i} className="ai-line">{line}</p>
        })}
      </div>
    </div>
  )
}

function UserMessage({ text }) {
  return (
    <div className="ai-msg-block user">
      <div className="ai-bubble user">{text}</div>
    </div>
  )
}

export default function AIAdvisor() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (q) => {
    const question = q || input.trim()
    if (!question || loading) return
    setInput('')
    setError(null)
    setMessages(prev => [...prev, { role: 'user', text: question }])
    setLoading(true)
    try {
      const res = await aiApi.ask(question)
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer }])
    } catch (e) {
      const msg = e.response?.data?.detail || 'Something went wrong. Please try again.'
      setError(msg)
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${msg}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const showWelcome = messages.length === 0

  return (
    <div className="ai-page">
      {/* Header */}
      <div className="ai-header">
        <button className="ai-back-btn" onClick={() => navigate(-1)}>
          <IonIcon icon={chevronBackOutline} />
        </button>
        <div className="ai-header-center">
          <div className="ai-header-icon"><IonIcon icon={sparklesOutline} /></div>
          <div>
            <div className="ai-header-title">AI Financial Advisor</div>
            <div className="ai-header-sub">Powered by Groq AI</div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="ai-chat-area">

        {showWelcome && (
          <div className="ai-welcome">
            <div className="ai-welcome-icon"><IonIcon icon={sparklesOutline} /></div>
            <div className="ai-welcome-title">Ask me anything about your finances</div>
            <div className="ai-welcome-sub">
              I'll analyse your income, expenses, loans, investments and credit cards to give you personalised advice.
            </div>
            <div className="ai-sample-grid">
              {SAMPLE_QUESTIONS.map((q, i) => (
                <button key={i} className="ai-sample-btn" onClick={() => send(q.text)}>
                  <IonIcon icon={q.icon} />
                  <span>{q.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === 'user'
            ? <UserMessage key={i} text={msg.text} />
            : <AIMessage key={i} text={msg.text} />
        )}

        {loading && (
          <div className="ai-msg-block ai">
            <div className="ai-avatar-icon"><IonIcon icon={sparklesOutline} /></div>
            <div className="ai-bubble ai"><TypingDots /></div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="ai-input-bar">
        <textarea
          ref={inputRef}
          className="ai-input"
          rows={1}
          placeholder="Ask about your finances…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          className={`ai-send-btn ${loading || !input.trim() ? 'disabled' : ''}`}
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          <IonIcon icon={sendOutline} />
        </button>
      </div>
    </div>
  )
}
