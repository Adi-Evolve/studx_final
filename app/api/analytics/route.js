import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  // Analytics API is completely disabled - return empty response
  return new Response(null, { status: 204 })
}

export async function GET(request) {
  // Analytics API is completely disabled - return empty response
  return new Response(null, { status: 204 })
}

async function trackPageView(data) {
  const { 
    page, 
    userAgent, 
    ip, 
    referrer, 
    sessionId, 
    userId = null 
  } = data
  
  // Get or create session
  let sessionData = null
  try {
    const { data: existingSession } = await supabase
      .from('analytics_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    
    sessionData = existingSession
  } catch (error) {
    // Create new session
    const { data: newSession } = await supabase
      .from('analytics_sessions')
      .insert({
        session_id: sessionId,
        user_id: userId,
        user_agent: userAgent,
        ip_address: ip,
        referrer: referrer,
        first_page: page,
        last_activity: new Date().toISOString(),
        page_views: 1
      })
      .select()
      .single()
    
    sessionData = newSession
  }
  
  // Update session
  if (sessionData) {
    await supabase
      .from('analytics_sessions')
      .update({
        last_activity: new Date().toISOString(),
        page_views: (sessionData.page_views || 0) + 1,
        last_page: page
      })
      .eq('session_id', sessionId)
  }
  
  // Track page view
  const { error } = await supabase
    .from('analytics_page_views')
    .insert({
      session_id: sessionId,
      user_id: userId,
      page: page,
      user_agent: userAgent,
      ip_address: ip,
      referrer: referrer,
      timestamp: new Date().toISOString()
    })
  
  if (error) throw error
  
  return Response.json({ success: true })
}

async function trackApiCall(data) {
  const { 
    endpoint, 
    method, 
    statusCode, 
    responseTime, 
    userAgent, 
    ip, 
    userId = null 
  } = data
  
  const { error } = await supabase
    .from('analytics_api_calls')
    .insert({
      endpoint: endpoint,
      method: method,
      status_code: statusCode,
      response_time: responseTime,
      user_id: userId,
      user_agent: userAgent,
      ip_address: ip,
      timestamp: new Date().toISOString()
    })
  
  if (error) throw error
  
  return Response.json({ success: true })
}

async function getAnalytics({ type = 'all', days = 30 }) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateISO = startDate.toISOString()
  
  try {
    // Get page views by day
    const { data: pageViews } = await supabase
      .from('analytics_page_views')
      .select('page, timestamp')
      .gte('timestamp', startDateISO)
      .order('timestamp', { ascending: true })
    
    // Get API calls by day
    const { data: apiCalls } = await supabase
      .from('analytics_api_calls')
      .select('endpoint, method, status_code, response_time, timestamp')
      .gte('timestamp', startDateISO)
      .order('timestamp', { ascending: true })
    
    // Get sessions
    const { data: sessions } = await supabase
      .from('analytics_sessions')
      .select('*')
      .gte('last_activity', startDateISO)
      .order('last_activity', { ascending: true })
    
    // Process data for charts
    const analytics = {
      summary: {
        totalPageViews: pageViews?.length || 0,
        totalApiCalls: apiCalls?.length || 0,
        totalSessions: sessions?.length || 0,
        uniqueVisitors: new Set(sessions?.map(s => s.ip_address)).size || 0
      },
      charts: {
        pageViewsByDay: processPageViewsByDay(pageViews, days),
        apiCallsByDay: processApiCallsByDay(apiCalls, days),
        topPages: processTopPages(pageViews),
        topApiEndpoints: processTopApiEndpoints(apiCalls),
        apiResponseTimes: processApiResponseTimes(apiCalls),
        visitorsOverTime: processVisitorsOverTime(sessions, days),
        deviceTypes: processDeviceTypes(sessions),
        referrers: processReferrers(sessions)
      }
    }
    
    return Response.json(analytics)
  } catch (error) {
    throw error
  }
}

function processPageViewsByDay(pageViews, days) {
  const dailyViews = {}
  const today = new Date()
  
  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    dailyViews[dateKey] = 0
  }
  
  // Count actual views
  if (pageViews) {
    pageViews.forEach(view => {
      const dateKey = view.timestamp.split('T')[0]
      if (dailyViews.hasOwnProperty(dateKey)) {
        dailyViews[dateKey]++
      }
    })
  }
  
  return {
    labels: Object.keys(dailyViews).map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    data: Object.values(dailyViews)
  }
}

function processApiCallsByDay(apiCalls, days) {
  const dailyCalls = {}
  const today = new Date()
  
  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    dailyCalls[dateKey] = 0
  }
  
  // Count actual calls
  if (apiCalls) {
    apiCalls.forEach(call => {
      const dateKey = call.timestamp.split('T')[0]
      if (dailyCalls.hasOwnProperty(dateKey)) {
        dailyCalls[dateKey]++
      }
    })
  }
  
  return {
    labels: Object.keys(dailyCalls).map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    data: Object.values(dailyCalls)
  }
}

function processTopPages(pageViews) {
  const pageCounts = {}
  
  if (pageViews) {
    pageViews.forEach(view => {
      pageCounts[view.page] = (pageCounts[view.page] || 0) + 1
    })
  }
  
  return Object.entries(pageCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }))
}

function processTopApiEndpoints(apiCalls) {
  const endpointCounts = {}
  
  if (apiCalls) {
    apiCalls.forEach(call => {
      const key = `${call.method} ${call.endpoint}`
      endpointCounts[key] = (endpointCounts[key] || 0) + 1
    })
  }
  
  return Object.entries(endpointCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([endpoint, count]) => ({ endpoint, count }))
}

function processApiResponseTimes(apiCalls) {
  if (!apiCalls || apiCalls.length === 0) {
    return { average: 0, min: 0, max: 0, distribution: [] }
  }
  
  const responseTimes = apiCalls
    .filter(call => call.response_time)
    .map(call => call.response_time)
  
  if (responseTimes.length === 0) {
    return { average: 0, min: 0, max: 0, distribution: [] }
  }
  
  const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
  const min = Math.min(...responseTimes)
  const max = Math.max(...responseTimes)
  
  // Create distribution buckets
  const buckets = [0, 100, 250, 500, 1000, 2000, 5000]
  const distribution = buckets.map((bucket, index) => {
    const nextBucket = buckets[index + 1] || Infinity
    const count = responseTimes.filter(time => time >= bucket && time < nextBucket).length
    return {
      range: nextBucket === Infinity ? `${bucket}ms+` : `${bucket}-${nextBucket}ms`,
      count
    }
  })
  
  return { average: Math.round(average), min, max, distribution }
}

function processVisitorsOverTime(sessions, days) {
  const dailyVisitors = {}
  const today = new Date()
  
  // Initialize all days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = date.toISOString().split('T')[0]
    dailyVisitors[dateKey] = new Set()
  }
  
  // Count unique visitors per day
  if (sessions) {
    sessions.forEach(session => {
      const dateKey = session.last_activity.split('T')[0]
      if (dailyVisitors.hasOwnProperty(dateKey)) {
        dailyVisitors[dateKey].add(session.ip_address)
      }
    })
  }
  
  return {
    labels: Object.keys(dailyVisitors).map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    data: Object.values(dailyVisitors).map(set => set.size)
  }
}

function processDeviceTypes(sessions) {
  const deviceCounts = { mobile: 0, desktop: 0, tablet: 0, other: 0 }
  
  if (sessions) {
    sessions.forEach(session => {
      const userAgent = session.user_agent?.toLowerCase() || ''
      
      if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
        deviceCounts.mobile++
      } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
        deviceCounts.tablet++
      } else if (userAgent.includes('windows') || userAgent.includes('mac') || userAgent.includes('linux')) {
        deviceCounts.desktop++
      } else {
        deviceCounts.other++
      }
    })
  }
  
  return Object.entries(deviceCounts)
    .filter(([,count]) => count > 0)
    .map(([device, count]) => ({ device, count }))
}

function processReferrers(sessions) {
  const referrerCounts = {}
  
  if (sessions) {
    sessions.forEach(session => {
      let referrer = session.referrer || 'Direct'
      
      // Simplify referrer
      if (referrer !== 'Direct') {
        try {
          const url = new URL(referrer)
          referrer = url.hostname
        } catch {
          referrer = 'Unknown'
        }
      }
      
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1
    })
  }
  
  return Object.entries(referrerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([referrer, count]) => ({ referrer, count }))
}

async function getItemViews({ contentType, contentId }) {
  try {
    const { data, error } = await supabase
      .from('analytics_views')
      .select('views')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // console.log('Error getting item views:', error)
      return Response.json({ views: 0 })
    }

    return Response.json({ views: data ? data.views : 0 })
  } catch (error) {
    // console.error('Error in getItemViews:', error)
    return Response.json({ views: 0 })
  }
}
