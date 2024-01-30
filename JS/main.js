var el = document.querySelector('.chrome-tabs')
var chromeTabs = new ChromeTabs()

chromeTabs.init(el)

el.addEventListener('activeTabChange', ({ detail }) => console.log('Active tab changed', detail.tabEl))
el.addEventListener('tabAdd', ({ detail }) => console.log('Tab added', detail.tabEl))
el.addEventListener('tabRemove', ({ detail }) => console.log('Tab removed', detail.tabEl))

chromeTabs.addTab({
  title: 'index.html',
  favicon: '/assets/HTML.svg'
})
chromeTabs.addTab({
  title: 'index.js',
  favicon: '/assets/JS.svg'
})

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 't') {
    chromeTabs.addTab({
      title: 'New Tab',
      favicon: false
    })
  }
})