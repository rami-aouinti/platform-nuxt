<template>
  <div
    class="quill mt-3"
    :class="this.$route.name == 'NewProduct' ? 'h-100' : ' '"
  >
    <div :id="toolbarId">
      <div class="ql-formats">
        <button class="ql-bold"></button>
        <button class="ql-italic"></button>
        <button class="ql-underline"></button>
        <button class="ql-link"></button>
        <button class="ql-blockquote"></button>
        <button class="ql-code"></button>
        <button class="ql-image"></button>
        <button type="button" class="ql-list" value="ordered"></button>
        <button type="button" class="ql-list" value="bullet"></button>
      </div>
    </div>
    <div :id="editorId" :name="name" class="" ref="editor"></div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import "quill/dist/quill.snow.css";
const editor = ref(null);
const content = ref(null);
const lastHtmlValue = ref("");
const editorId = ref(null);
const toolbarId = ref(null);
function initialize(Quill) {
  editor.value = new Quill(`#${editorId.value}`, {
    theme: "snow",
    modules: {
      toolbar: `#${toolbarId.value}`
    }
  });
  if (value.length > 0) {
    editor.value.pasteHTML(value);
  }
  let editorRef = $refs.editor;
  let node = editorRef.children[0];
  editor.value.on("text-change", () => {
    let html = node.innerHTML;
    if (html === "<p><br></p>") {
      html = "";
    }
    content.value = html;
    $emit("input", content.value);
  });
}
function pasteHTML() {
  if (!editor.value) {
    return;
  }
  editor.value.pasteHTML(value);
}
function randomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
onMounted(() => {
  let Quill = await import("quill");
  Quill = Quill.default || Quill;
  editorId.value = randomString();
  toolbarId.value = randomString();
  nextTick(() => {
    initialize(Quill);
  });
});
watch(value, newVal => {
  if (newVal !== content.value) {
    pasteHTML(newVal);
  }
});
</script>
