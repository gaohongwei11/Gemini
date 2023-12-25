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
            placeholder="请输入内容向Gemini提问"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button
              html-type="submit"
              :loading="submitting"
              type="primary"
              @click="handleSubmit"
            >
              发送
            </a-button>
            <a-button :loading="resetting" @click="handleReset">
              重置
            </a-button>
          </a-space>
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
        <a-comment
          :author="item.author"
          :avatar="item.avatar"
          :key="index"
          :datetime="item.datetime"
        >
          <div slot="content" v-html="item.content"></div>
        </a-comment>
      </a-list-item>
    </a-list>
  </a-card>
</template>

<script>
import { sendMessage, reset } from "@/api/gemini";
import moment from "moment";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);

export default {
  name: "Success",
  data() {
    return {
      comments: [],
      submitting: false,
      resetting: false,
      value: "",
      moment,
    };
  },
  methods: {
    async handleSubmit() {
      if (!this.value) {
        return;
      }
      this.submitting = true;
      sendMessage({ msg: this.value })
        .then((res) => {
          this.comments = [
            {
              author: "Gemini",
              avatar:
                "//www.gstatic.com/alkali/749db29700a8a8bd6b2a0ff0acd5899cbf294575.svg",
              content: marked.parse(res.data.responseText),
              datetime: moment().fromNow(),
            },
            ...this.comments,
          ];
        })
        .catch((err) => {
          //
        })
        .finally(() => {
          this.submitting = false;
          this.value = "";
        });
    },
    handleChange(e) {
      this.value = e.target.value;
    },
    handleReset() {
      this.resetting = true;
      reset()
        .then((res) => {
          this.comments = [];
        })
        .catch((err) => {
          //
        })
        .finally(() => {
          this.resetting = false;
        });
    },
  },
};
</script>

<style scoped>
@import "highlight.js/styles/dark.css";
/deep/ .hljs {
  border-radius: 6px !important;
}
/deep/ .ant-comment {
  max-width: 100%;
}
</style>
