// https://raw.githubusercontent.com/VladyslavKvaskov/select-component/main/select-component.js
class SelectComponent extends HTMLSelectElement {
    constructor() {
        super();

        SelectComponent.counter = SelectComponent.counter + 1 || 1;

        this._selectContainer = this.createElement({
            class: 'select-container',
        });

        this._selectContainer.classList.add(`select-instance-${SelectComponent.counter}`);

        this._shadowDOM = this._selectContainer.attachShadow({ mode: 'closed' });

        this._select = this.createElement({
            class: 'select',
        });

        this._value = this.createElement({
            class: 'value',
        });

        this._selectButton = this.createElement({
            tag: 'button',
            type: 'button',
            class: 'select-button',
        });

        this._optionsContainer = this.createElement({
            class: 'options',
        });

        this._dropdownContainer = this.createElement({
            class: 'dropdown-container',
        });

        this._selectDropdown = this.createElement({
            class: 'dropdown',
        });

        this._selectSearchContainer = this.createElement({
            class: 'search-container',
        });

        this._selectSearch = this.createElement({
            tag: 'input',
            type: 'text',
            placeholder: 'Search...',
        });

        this._selectAll = this.createElement({
            tag: 'button',
            type: 'button',
            class: 'selectall-button',
        });

        this.insertAdjacentElement('beforebegin', this._selectContainer);
        this._selectContainer.appendChild(this);

        this._optionsSelectedDiv = this.createElement({
            class: 'selected-options',
        });

        if (this.getAttribute('selected-options') !== null && this.getAttribute('multiple') !== null) {
            try {
                this._selectedOptions = document.querySelector(this.getAttribute('selected-options'));
            } catch (err) {
                this._selectedOptions = null;
            }

            if (!this._selectedOptions) {
                this._selectedOptions = this._optionsSelectedDiv;
                this._selectContainer.insertAdjacentElement('afterend', this._optionsSelectedDiv);
            } else {
                this._optionsSelectedDiv.remove();
            }
        }

        if (!document.querySelector('.select-component-css')) {
            document.head.insertAdjacentHTML(
                'afterbegin',
                `
                <style class="select-component-css">
                    .selected-option-button{
                        -webkit-appearance: button;
                        appearance: button;
                        border: none;
                        background-color: #4c84ff;
                        color: #fff;
                        border-radius: 4px;
                        padding: 3px 5px;
                        font-size: 12px;
                        margin: 5px 5px 0 0;
                        cursor: pointer;
                        transition: 0.3s;
                    }

                    .selected-option-button:nth-child(1){
                        margin-left: 0;
                    }

                    .selected-option-button:hover{
                        background-color: #1961ff;
                    }
                </style>
            `
            );
        }

        this._selectAll.addEventListener('click', () => {
            this._selectAll.classList.toggle('selected');
            for (let i = 0; i < this.options.length; i++) {
                if (this._selectAll.classList.contains('selected')) {
                    if (!this.options[i].selected) {
                        this.options[i].selected = true;
                        this._options[i].option.classList.add('selected');
                        if (this._selectedOptions) {
                            this._selectedOptions.insertAdjacentElement('beforeend', this._options[i].bttn);
                        }
                    }
                } else {
                    if (this.options[i].selected) {
                        this.options[i].selected = false;
                        this._options[i].option.classList.remove('selected');
                        if (this._selectedOptions) {
                            this._options[i].bttn.remove();
                        }
                    }
                }
            }

            if (this._selectAll.classList.contains('selected')) {
                this._selectAll.textContent = 'Deselect all';
            } else {
                this._selectAll.textContent = 'Select all';
            }

            this.setValue();
            this.dispatchEvent(new Event('change'));
        });

        this._selectSearchContainer.appendChild(this._selectSearch);

        document.addEventListener('click', (e) => {
            if (e.target.closest('.select-container') !== this._selectContainer) {
                this._select.classList.remove('show');
                this.timeoutShow = setTimeout(() => {
                    this._dropdownContainer.remove();
                }, 150);
            }
        });

        this._select.addEventListener('click', (e) => {
            clearTimeout(this.hideTimeout);
            clearTimeout(this.showTimeout);
            if (e.target.closest('button') === this._selectButton) {
                if (!this._select.classList.contains('show')) {
                    this._select.appendChild(this._dropdownContainer);
                    this.showTimeout = setTimeout(() => {
                        this._select.classList.add('show');
                    });
                } else {
                    this._select.classList.remove('show');
                    this.hideTimeout = setTimeout(() => {
                        this._dropdownContainer.remove();
                    }, 150);
                }
            }
        });

        this._options = [];

        for (let option of this.options) {
            this._options.push({
                option: this.createElement({
                    class: `option ${option.selected ? 'selected' : ''}`,
                    text: option.textContent,
                }),

                bttn: this.createElement({
                    tag: 'button',
                    type: 'button',
                    class: 'selected-option-button',
                    text: option.textContent,
                }),
            });

            let els = this._options[this._options.length - 1];

            els.option.addEventListener('click', () => {
                if (this.getAttribute('multiple') === null) {
                    option.selected = true;
                } else {
                    if (option.selected) {
                        option.selected = false;
                        els.option.classList.remove('selected');
                        if (this._selectedOptions) {
                            els.bttn.remove();
                        }
                    } else {
                        option.selected = true;
                        els.option.classList.add('selected');
                        if (this._selectedOptions) {
                            this._selectedOptions.insertAdjacentElement('beforeend', els.bttn);
                        }
                    }

                    if (this.options.length === Array.from(this.options).filter((a) => a.selected).length) {
                        this._selectAll.textContent = 'Deselect all';
                        this._selectAll.classList.add('selected');
                    } else {
                        this._selectAll.textContent = 'Select all';
                        this._selectAll.classList.remove('selected');
                    }
                }
                if (this.getAttribute('multiple') === null) {
                    for (let i = 0; i < this.options.length; i++) {
                        if (this.options[i].selected) {
                            this._options[i].option.classList.add('selected');
                        } else {
                            this._options[i].option.classList.remove('selected');
                        }
                    }
                }
                this.dispatchEvent(new Event('change'));
            });

            els.bttn.addEventListener('click', () => {
                option.selected = false;
                els.option.classList.remove('selected');
                els.bttn.remove();
                this.setValue();
            });

            this._optionsContainer.appendChild(this._options[this._options.length - 1].option);
        }

        this._selectSearch.addEventListener('input', () => {
            this.search();
        });

        delete this._option;

        this._selectContainer.style['display'] = 'inline-block';
        this._selectContainer.style['min-width'] = '50px';

        this._selectButton.appendChild(this._value);
        this._select.appendChild(this._selectButton);
        this._selectDropdown.appendChild(this._optionsContainer);
        this._dropdownContainer.appendChild(this._selectDropdown);
        this._shadowDOM.appendChild(
            this.createElement({
                tag: 'style',
                html: `
                    *{
                        box-sizing: border-box;
                        -webkit-overflow-scrolling: touch;
                    }
                    button{
                        -webkit-appearance: button;
                        appearance: button;
                    }
                    .select{
                        color: #000;
                    }
                    .select-button{
                        background: #fff;
                        border: 1px solid #8a909d;
                        height: 30px;
                        border-radius: 4px;
                        cursor: pointer;
                        min-width: 100%;
                    }
                    .selectall-button{
                        border-radius: 0;
                        width: 100%;
                        background: #fff;
                        border: none;
                        cursor: pointer;
                        height: 30px;
                    }
                    .dropdown-container{
                        position: relative;
                        transition: transform 0.15s, opacity 0.15s;
                        will-change: transform, opacity;
                        opacity: 0;
                        transform: scale(0.8);
                        min-width: 100%;
                        z-index: 3;
                    }
                    .show .dropdown-container{
                        opacity: 1;
                        transform: scale(1);
                    }
                    .dropdown{
                        position: absolute;
                        top: 0;
                        left: 0;
                        border: 1px solid #8a909d;
                        border-radius: 4px;
                        overflow: hidden;
                        min-width: 100%;
                        background: #fff;
                    }
                    span.highlight{
                        background: #fec400;
                        color: #000;
                    }
                    .value{
                        height: 100%;
                        display: flex;
                        align-items: center;
                        user-select: none;
                        white-space: nowrap;
                        width: fit-content;
                        margin-right: 10px;
                        position: relative;
                        min-width: 86px;
                    }
                    .value::after{
                        content: '';
                        position: absolute;
                        top: 50%;
                        right: -10px;
                        transform: translateY(-50%);
                        background: #000;
                        width: 5px;
                        height: 10px;
                        transition: transform 0.15s;
                        will-change: transform;
                        clip-path: polygon(0 0, 100% 50%, 0 100%);
                    }
                    .show .value::after{
                        transform: translateY(-50%) rotate(90deg);
                    }
                    .options{
                        user-select: none;
                        max-height: 300px;
                        overflow: auto;
                    }
                    .option:hover{
                        background: #e6f4fc;
                    }
                    .option{
                        cursor: pointer;
                        padding: 5px 10px;
                        white-space: nowrap;
                    }
                    .option.selected{
                        color: #fff;
                        background: #4c84ff;
                    }
                    input{
                        width: 100%;
                        outline: none;
                        border: none;
                        padding: 5px 10px;
                        -webkit-appearance: textfield;
                        appearance: textfield;
                    }
                    ::-webkit-scrollbar{
                        width: 5px;
                        height: 5px;
                    }
                    ::-webkit-scrollbar-track{
                        background: #fcfcfc;
                    }
                    ::-webkit-scrollbar-thumb{
                        background: #ccc;
                    }
                `,
            })
        );

        this._shadowDOM.appendChild(this._select);

        this.addEventListener('change', () => {
            this.setValue();
        });

        this.setValue();

        if (this.getAttribute('search') !== null) {
            this._selectDropdown.insertAdjacentElement('afterbegin', this._selectSearchContainer);
        }

        if (this.getAttribute('selectall') !== null && this.getAttribute('multiple') !== null) {
            this._optionsContainer.insertAdjacentElement('beforebegin', this._selectAll);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.connected) {
            if (name === 'multiple') {
                for (let i = 0; i < this.options.length; i++) {
                    if (this.options[i].selected) {
                        this._options[i].option.classList.add('selected');
                    } else {
                        this._options[i].option.classList.remove('selected');
                    }
                }

                if (newValue === null && this.getAttribute('selectall') !== null) {
                    this.removeSelectedOptionsBttns();
                } else if (newValue !== null && this.getAttribute('selectall') !== null) {
                    this.getSelectedOptionsElement();
                }

                if (this.getAttribute('selectall') === null) {
                    this._selectAll.remove();
                } else {
                    this._optionsContainer.insertAdjacentElement('beforebegin', this._selectAll);
                }
                this.dispatchEvent(new Event('change'));
            } else if (name === 'search') {
                if (newValue === null) {
                    for (this._tmp of this._options) {
                        this._optionsContainer.appendChild(this._tmp.option);
                    }
                    this.nodesUnhighlight(this._optionsContainer);

                    this._selectSearchContainer.remove();
                } else {
                    this._selectDropdown.insertAdjacentElement('afterbegin', this._selectSearchContainer);
                    this.search();
                }
            } else if (name === 'selectall') {
                if (this.getAttribute('multiple') !== null) {
                    if (newValue === null) {
                        this._selectAll.remove();
                    } else {
                        this._optionsContainer.insertAdjacentElement('beforebegin', this._selectAll);
                    }
                }
            } else if (name === 'selected-options') {
                if (this.getAttribute('selected-options') !== null && this.getAttribute('multiple') !== null) {
                    this.getSelectedOptionsElement();
                } else {
                    if (this._selectedOptions) {
                        this.removeSelectedOptionsBttns();
                    }
                    this._optionsSelectedDiv.remove();
                }
            }
        }
    }

    getSelectedOptionsElement() {
        try {
            this._selectedOptions = document.querySelector(this.getAttribute('selected-options'));
        } catch (err) {
            this._selectedOptions = null;
        }

        if (!this._selectedOptions) {
            this._selectedOptions = this._optionsSelectedDiv;
            this._selectContainer.insertAdjacentElement('afterend', this._optionsSelectedDiv);
        } else {
            this._optionsSelectedDiv.remove();
        }

        if (this._selectedOptions) {
            this.removeSelectedOptionsBttns();
        }

        for (let i = 0; i < this.options.length; i++) {
            if (this.options[i].selected) {
                this._selectedOptions.insertAdjacentElement('beforeend', this._options[i].bttn);
            }
        }
    }

    removeSelectedOptionsBttns() {
        for (this._tmp of this._options) {
            this._tmp?.bttn?.remove();
        }
    }

    static get observedAttributes() {
        return ['multiple', 'search', 'selectall', 'selected-options'];
    }

    search() {
        for (this._tmp of this._options) {
            if (this._tmp.option.textContent.trim().toLowerCase().includes(this._selectSearch.value.trim().toLowerCase())) {
                this._optionsContainer.appendChild(this._tmp.option);
            } else {
                this._tmp.option.remove();
            }
        }
        this.nodesUnhighlight(this._optionsContainer);
        this.nodesHighlight(this._optionsContainer, this._selectSearch.value.trim().toLowerCase());
    }

    createElement(obj = {}) {
        this._elementTag = obj.tag ? obj.tag : 'div';
        this._tmpElement = obj.is ? document.createElement(this._elementTag, { is: obj.is }) : document.createElement(this._elementTag);

        for (this._prop in obj) {
            if (this._prop !== 'tag' && this._prop !== 'text' && this._prop !== 'html' && typeof obj[this._prop] !== 'function') {
                this._tmpElement.setAttribute(this._prop, obj[this._prop]);
            } else if (this._prop === 'text') {
                this._tmpElement.textContent = String(obj.text);
                this._tmpElement.value = String(obj.text);
            } else if (this._prop === 'html') {
                this._tmpElement.innerHTML = String(obj.html);
            } else if (typeof obj[this._prop] === 'function') {
                obj[this._prop](this._tmpElement);
            }
        }

        delete this._elementTag;
        delete this._prop;

        return this._tmpElement;
    }

    setValue() {
        this._tmp = [];

        for (this._option of this.options) {
            if (this._option.selected) {
                this._tmp.push(this._option.textContent);
            }
        }

        delete this._option;
        if (this._tmp.length === 0) {
            this._value.classList.add('placeholder');
            this._value.textContent = 'None selected';
        } else {
            this._value.classList.remove('placeholder');
            if (this._tmp.length === 1) {
                this._value.textContent = this._tmp.join(', ');
            } else {
                this._value.textContent = this._tmp.length + ' selected';
            }
        }
    }

    nodesHighlight(node, re) {
        if (re) {
            this.re = new RegExp(re, 'i');
            if (node.nodeType === 3) {
                this.match = node.data.match(this.re);
                if (this.match) {
                    this.highlighter = document.createElement('span');
                    this.highlighter.className = 'highlight';
                    this.wordNode = node.splitText(this.match.index);
                    this.wordNode.splitText(this.match[0].length);
                    this.wordClone = this.wordNode.cloneNode(true);
                    this.highlighter.appendChild(this.wordClone);
                    this.wordNode.parentNode.replaceChild(this.highlighter, this.wordNode);
                    return 1;
                }
            } else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName) && !(node.tagName === 'span'.toUpperCase() && node.className === 'highlight')) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    i += this.nodesHighlight(node.childNodes[i], this.re, 'span', 'highlight');
                }
            }
            return 0;
        }
    }

    nodesUnhighlight(el) {
        for (this.highlighter of el.querySelectorAll('span.highlight')) {
            this.pNode = this.highlighter.parentNode;
            this.pNode.replaceChild(document.createTextNode(this.highlighter.textContent), this.highlighter);
            this.pNode.normalize();
        }
    }

    connectedCallback() {
        this.connected = true;
        this.allSelected = true;
        setTimeout(() => {
            this._tmp = [];
            this._val = '';
            for (let i = 0; i < this.options.length; i++) {
                if (this.options[i].selected) {
                    this._options[i].option.classList.add('selected');
                    if (this._selectedOptions) {
                        this._selectedOptions.insertAdjacentElement('beforeend', this._options[i].bttn);
                    }
                    this._tmp.push(this._options[i].option.textContent);
                } else {
                    this.allSelected = false;
                    this._options[i].option.classList.remove('selected');
                }
            }

            if (this.allSelected) {
                this._selectAll.textContent = 'Deselect all';
                this._selectAll.classList.add('selected');
            } else {
                this._selectAll.textContent = 'Select all';
                this._selectAll.classList.remove('selected');
            }

            if (this._tmp.length === 0) {
                this._value.classList.add('placeholder');
                this._value.textContent = 'None selected';
            } else {
                this._value.classList.remove('placeholder');
                if (this._tmp.length === 1) {
                    this._value.textContent = this._tmp.join(', ');
                } else {
                    this._value.textContent = this._tmp.length + ' selected';
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    customElements.define('select-component', SelectComponent, {
        extends: 'select',
    });
});