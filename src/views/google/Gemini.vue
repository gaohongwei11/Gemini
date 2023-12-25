<template>
  <a-card :bordered="false">
    <a-comment>
      <div slot="content">
        <a-form-item>
          <a-textarea
            :max-length="30720"
            :rows="4"
            allowClear
            :value="value"
            @change="handleChange"
            placeholder="请输入内容向Gemini提问" />
        </a-form-item>
        <a-form-item>
          <a-button html-type="submit" :loading="submitting" type="primary" @click="handleSubmit"> 发送 </a-button>
        </a-form-item>
      </div>
    </a-comment>
    <a-list
      v-if="comments.length"
      :data-source="comments"
      :header="`${comments.length}条回复`"
      item-layout="horizontal"
    >
      <a-list-item slot="renderItem" slot-scope="item, index">
        <a-comment :author="item.author" :avatar="item.avatar" :key="index" :datetime="item.datetime">
          <div slot="content" v-html="item.content"></div>
        </a-comment>
      </a-list-item>
    </a-list>
  </a-card>
</template>

<script>
import moment from 'moment'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight (code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    }
  })
)
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai')
const MODEL_NAME = 'gemini-pro'
const API_KEY = 'AIzaSyCgtc9C7r-aVJkwhVTGsJGByl8-TbkbOps'

export default {
  name: 'Success',
  data () {
    return {
      comments: [],
      submitting: false,
      value: '',
      moment
    }
  },
  methods: {
    async handleSubmit () {
      if (!this.value) {
        return
      }
      this.submitting = true
      const result = await this.run(this.value)
      this.submitting = false
      this.comments = [
        {
          author: 'Gemini',
          avatar: '//www.gstatic.com/alkali/749db29700a8a8bd6b2a0ff0acd5899cbf294575.svg',
          content: marked.parse(result),
          datetime: moment().fromNow()
        },
        ...this.comments
      ]
      this.value = ''
    },
    handleChange (e) {
      this.value = e.target.value
    },
    async run (text) {
      return new Promise(async (resolve, reject) => {
        const genAI = new GoogleGenerativeAI(API_KEY)
        const model = genAI.getGenerativeModel({ model: MODEL_NAME })

        const generationConfig = {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048
        }

        const safetySettings = [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
          }
        ]

        const parts = [{ text: text }]

        try {
          const result = await model.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig,
            safetySettings
          })

          const response = result.response
          console.log(response.text())
          resolve(response.text())
        } catch (error) {
          resolve('Error，请切换节点后再试！')
        }
      })
    }
  }
}
</script>

<style scoped>
@import "highlight.js/styles/dark.css";
/deep/ .hljs{
  border-radius: 6px !important;
}
/deep/ .ant-comment{
  max-width: 100%;
}
</style>
