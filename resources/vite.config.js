export default {
  build: {
    rollupOptions: {
      input: 'src/project.inline.html',
      output: {
        entryFileNames: 'project.js',
        assetFileNames: 'project.css'
      }
    }
  }
};