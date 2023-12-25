import request from '@/utils/request'

const geminiApi = {
  sendMessage: 'https://gemini-api-vjxb.onrender.com/ai/gemini/sendMessage',
  reset: 'https://gemini-api-vjxb.onrender.com/ai/gemini/reset'
}

export function sendMessage(parameter) {
  return request({
    url: geminiApi.sendMessage,
    method: 'post',
    data: parameter
  })
}
export function reset(parameter) {
  return request({
    url: geminiApi.reset,
    method: 'post',
    data: parameter
  })
}
