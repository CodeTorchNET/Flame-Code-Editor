class PreviewHandler {
    constructor() {
        this.init = function (el, terminalEl, id) {
            this._data.PID = id;
            this._data.el = el;
            this._data.terminalEl = terminalEl;
            el.src = `/projects/${id}/index.html`;
            this._attachTerminal();
            this.waitForMessageFromTerminal();
            let lastScrollTop = 0;
            const scrollableDiv = document.getElementsByClassName('terminalScroller')[0];
            scrollableDiv.addEventListener('scroll', function () {
                let st = scrollableDiv.scrollTop;
                if (st < lastScrollTop) {
                    this._data.autoScroll = false;
                }
                if (scrollableDiv.scrollTop + scrollableDiv.clientHeight >= scrollableDiv.scrollHeight) {
                    this._data.autoScroll = true;
                }
                lastScrollTop = st <= 0 ? 0 : st;
            }.bind(this));
            document.getElementById('persistlogs').addEventListener('click', function () {
                if(document.getElementById('persistlogs').classList.contains('active')){
                    document.getElementById('persistlogs').classList.remove('active');
                    this._data.persistLogs = false;
                }else{
                    document.getElementById('persistlogs').classList.add('active');
                    this._data.persistLogs = true;
                }
            }.bind(this));
            document.getElementById('clearTerminal').addEventListener('click', function () {
                this._data.terminalEl.innerHTML = '';
                this._data.errorNum = 0;
                this._data.warningNum = 0;
                document.getElementById('errorNumber').innerHTML = 0;
                document.getElementById('warningNumber').innerHTML = 0;
            }.bind(this));
        },
            this.reload = function () {
                this._data.el.src = `/projects/${this._data.PID}/index.html`
                this._attachTerminal();
                if(!this._data.persistLogs){
                    this._data.terminalEl.innerHTML = '';
                    this._data.errorNum = 0;
                    this._data.warningNum = 0;
                    document.getElementById('errorNumber').innerHTML = 0;
                    document.getElementById('warningNumber').innerHTML = 0;
                }
            },
            this._attachTerminal = function () {
                this._data.el.onload = function () {
                    var iframeDocument = this._data.el.contentDocument || this._data.el.contentWindow.document;
                    var terminalOverride = document.createElement('script');
                    terminalOverride.src = '/JS/terminal.js';
                    iframeDocument.body.appendChild(terminalOverride);
                }.bind(this)
            },
            this._handleScrolling = function () {
                if (document.getElementsByClassName('terminalScroller')[0].clientHeight <= document.getElementById('terminal').clientHeight) {
                    if (this._data.autoScroll) {
                        document.getElementsByClassName('terminalScroller')[0].scrollTop = document.getElementsByClassName('terminalScroller')[0].scrollHeight;
                    }
                }else{
                    document.getElementsByClassName('terminalScroller')[0].scrollTop = 0;
                }
            },
            this.waitForMessageFromTerminal = function () {
                window.addEventListener('message', function (e) {
                    if (e.data[0] === 'console.log' || e.data[0] === 'console.debug') {
                        var data = e.data.slice(1);
                        var FinalData = this._terminalContent(data);
                        var HTML = document.createElement('div');
                        HTML.className = 'terminalLine';
                        HTML.innerHTML = '<p>' + FinalData + '</p><p>' + data[0] + '</p>';
                        this._data.terminalEl.appendChild(HTML);
                        this._handleScrolling()
                    } else if (e.data[0] === 'console.error') {
                        var data = e.data.slice(1);
                        var FinalData = this._terminalContent(data);
                        var HTML = document.createElement('div');
                        HTML.className = 'terminalLine error';
                        HTML.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg><p>' + FinalData + '</p><p>' + data[0] + '</p>';
                        this._data.terminalEl.appendChild(HTML);
                        this._handleScrolling();
                        this._data.errorNum++;
                        document.getElementById('errorNumber').innerHTML = this._data.errorNum;
                    } else if (e.data[0] === 'console.warn') {
                        var data = e.data.slice(1);
                        var FinalData = this._terminalContent(data);
                        var HTML = document.createElement('div');
                        HTML.className = 'terminalLine warning';
                        HTML.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg><p>' + FinalData + '</p><p>' + data[0] + '</p>'
                        this._data.terminalEl.appendChild(HTML);
                        this._handleScrolling()
                        this._data.warningNum++;
                        document.getElementById('warningNumber').innerHTML = this._data.warningNum;
                    } else if (e.data[0] === 'console.info') {
                        var data = e.data.slice(1);
                        var FinalData = this._terminalContent(data);
                        var HTML = document.createElement('div');
                        HTML.className = 'terminalLine info';
                        HTML.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg><p>' + FinalData + '</p><p>' + data[0] + '</p>';
                        this._data.terminalEl.appendChild(HTML);
                        this._handleScrolling()
                    } else if (e.data[0] === 'console.trace') {
                        var data = e.data.slice(1);
                        var HTML = document.createElement('div');
                        HTML.className = 'terminalLine error';
                        HTML.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" /></svg><p>Console.trace is currently not supported</p><p>NA:NA</p>';
                        this._data.terminalEl.appendChild(HTML);
                        this._handleScrolling()
                    } else if (e.data[0] === 'console.clear') {
                        this._data.terminalEl.innerHTML = '';
                        this._data.errorNum = 0;
                        this._data.warningNum = 0;
                        document.getElementById('errorNumber').innerHTML = 0;
                        document.getElementById('warningNumber').innerHTML = 0;
                        var HTML = document.createElement('div');
                        HTML.className = 'terminalLine info';
                        HTML.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg><p>Console was cleared via console.clear()</p><p></p>';
                        this._data.terminalEl.appendChild(HTML);
                        this._handleScrolling();
                    }
                }.bind(this))
            },
            this._terminalContent = function (data) {
                var FinalData = '';
                for (var i = 1; i < data.length; i++) {
                    //check if data[i] is an object
                    if (typeof data[i] === 'object') {
                        //check if data[i] is an array
                        if (Array.isArray(data[i])) {
                            //check if data[i] is a typed array
                            if (data[i].buffer) {
                                FinalData += ' TypedArray: ' + data[i].constructor.name + ' ' + data[i].buffer.byteLength + ' bytes';
                            } else {
                                FinalData += ' Array: ' + JSON.stringify(data[i]);
                            }
                        } else {
                            FinalData += ' Object: ' + JSON.stringify(data[i]);
                        }
                    } else {
                        FinalData += ' ' + data[i];
                    }
                }
                return FinalData;
            }
        this._data = {
            PID: null,
            el: null,
            terminalEl: null,
            autoScroll: true,
            errorNum: 0,
            warningNum: 0,
            persistLogs: false
        }
    }
}