import { describeWeatherCode } from '../lib/weather'

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Context string for AI prompt
export function buildWeatherContext(weather, location) {
  const { current, hourly, daily } = weather

  // Context for the next 12 hours
  const now = new Date(current.time)
  const next12h = hourly
    .filter(h => new Date(h.time) >= now)
    .slice(0, 12)

  // COntext for the next 5 days
  const next5d = daily.slice(0, 5)

  return `
LOCATION: ${location.name}, ${location.country}
LOCAL TIME: ${new Date(current.time).toLocaleString()}

NOW:
  ${Math.round(current.temp)}°C (feels ${Math.round(current.feelsLike)}°C)
  ${describeWeatherCode(current.code)}
  Humidity ${current.humidity}%, Wind ${Math.round(current.windSpeed)} km/h, UV ${current.uvIndex}
  Visibility ${(current.visibility / 1000).toFixed(1)} km

NEXT 12 HOURS:
${next12h.map(h =>
  `  ${h.time.slice(11, 16)}  ${Math.round(h.temp)}°C  ${h.precipProb ?? 0}% rain  ${describeWeatherCode(h.code)}`
).join('\n')}

NEXT 5 DAYS:
${next5d.map(d =>
  `  ${d.time}  ${Math.round(d.tempMin)}–${Math.round(d.tempMax)}°C  ${d.precipProb ?? 0}% rain  ${describeWeatherCode(d.code)}`
).join('\n')}
`.trim()
}

// Daily briefing
export async function generateBriefing(weatherContext, userName) {
  const prompt = 
  `You are ClimaSphere, a calm and precise climate intelligence system.
  Write a daily briefing for ${userName ?? 'the user'} in 2–3 sentences, tailored to the location of the weather (50 words max).
  The tone shoud be simple, quiet, calm, a little fun, and intelligent, like a trusted advisor, not a weather presenter.
  Focus on the key weather event of the day and what the user should do about it.
  Never start with a greeting, use weather emojis, or repeat raw numbers when a word works better.

WEATHER DATA:
${weatherContext}`

  return callAI(prompt)
}

// AI Copilot
export async function askCopilot(question, weatherContext, history = []) {
  const system = `You are ClimaSphere's weather copilot, a calm, precise intelligence that helps people make decisions based on weather conditions.
  Answer in 1–3 sentences unless a list genuinely helps. Translate data into decisions, not numbers.
  When uncertain, say so. Never use weather emojis. Never fabricate weather conditions.

CURRENT WEATHER DATA:
${weatherContext}`

  return callAI(question, system, history)
}

// Internals

async function callAI(prompt, systemPrompt = null, history = []) {
  const geminiKey = import.meta.env.GEMINI_API_KEY
  const groqKey = import.meta.env.GROQ_API_KEY

  if (geminiKey) {
    try {
      return await callGemini(prompt, systemPrompt, history, geminiKey)
    } catch (err) {
      console.warn('[ClimaSphere AI] Gemini failed, trying Groq:', err.message)
    }
  }

  if (groqKey) {
    return await callGroq(prompt, systemPrompt, history, groqKey)
  }

  // If neither key is provided, return null
  return null
}

async function callGemini(prompt, systemPrompt, history, apiKey) {
  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
    { role: 'user', parts: [{ text: prompt }] },
  ]

  const body = {
    contents,
    ...(systemPrompt && {
      systemInstruction: { parts: [{ text: systemPrompt }] },
    }),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
    },
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Gemini ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
}

async function callGroq(prompt, systemPrompt, history, apiKey) {
  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...history,
    { role: 'user', content: prompt },
  ]

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7,
      max_tokens:  300,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error?.message ?? `Groq ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? null
}
