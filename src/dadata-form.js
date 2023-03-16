customElements.define('dadata-form', class extends HTMLElement {

    constructor() {
        super();
        this.url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party';
        this.getAPIOptions = (query, token) => ({
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Token ' + token
            },
            body: JSON.stringify({ query: query })
        });
        this.inputNames = {
            short_name: 'Краткое наименование',
            full_name: 'Полное наименование',
            inn_kpp: 'ИНН / КПП',
            address: 'Адрес'
        };
        this.typeTexts = {
            LEGAL: 'Организация',
            INDIVIDUAL: 'Индивидуальный предприниматель',
        };
        this.resultElements = {};
    }

    getStyle() {
        return `<style>
                :host {
                    width: 100%;
                    max-width: 800px;
                    display: block;
                    ${this.getAttribute('hostStyle') || ''}
                }
                :host * {
                    font-family: inherit;
                    margin: 0;
                    box-sizing: border-box;
                }
                label, .inputSlotWrapper {
                    width: 100%;
                    max-width: 100%;
                    display: flex;
                    flex-direction: column;
                    ${this.getAttribute('inputContainerStyle') || ''}
                }
                input, ::slotted(input) {
                    max-width: 100%;
                    border: 1px solid transparent;
                    outline: none;
                    padding: 10px 15px;
                    border-radius: 8px;
                    background: rgba(121, 121, 121, 0.05);
                    color: inherit;
                    font-size: 1rem;
                    transition: 0.2s;
                    font-family: inherit;
                    ${this.getAttribute('inputStyle') || ''}
                }
                input:hover, ::slotted(input:hover) {
                    border-color: rgba(121, 121, 121, 0.5);
                    ${this.getAttribute('inputHoverStyle') || ''}
                }
                input:focus, ::slotted(input:focus) {
                    border-color: rgba(121, 121, 121, 0.7);
                    background: transparent;
                    ${this.getAttribute('inputFocusStyle') || ''}
                }
                input:not(:placeholder-shown), ::slotted(input:not(:placeholder-shown)) {
                    background: transparent;
                    border-color: rgba(121, 121, 121, 0.05);
                    ${this.getAttribute('inputFilledStyle') || ''}
                }
                input::placeholder, ::slotted(input::placeholder) {
                    color: rgb(200, 200, 200);
                    ${this.getAttribute('inputPlaceholderStyle') || ''}
                }
                #error {
                    display: block;
                    font-size: 0.8rem;
                    color: red;
                    opacity: 0;
                    padding: 5px 0 0 10px;
                    transition: .2s;
                    will-change: transform;
                    transform: scale(0);
                    transform-origin: 0 0;
                    ${this.getAttribute('errorStyle') || ''}
                }
                #suggestionsContainer {
                    position: absolute;
                    left: 0;
                    top: calc(100% - 8px);
                    width: 100%;
                    max-width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                    padding: 15px 0;
                    background: white;
                    border: 1px solid rgba(121, 121, 121, 0.7);
                    font-weight: normal;
                    opacity: 0;
                    transition: .2s;
                    will-change: transform;
                    transform: scaleY(0);
                    transform-origin: 100% 0;
                    z-index: 1;
                    ${this.getAttribute('suggestionsContainerStyle') || ''}
                }
                #suggestionsTitle {
                    color: rgba(121, 121, 121, 0.7);
                    font-size: 0.85rem;
                    padding: 0 0 8px 8px;
                    ${this.getAttribute('suggestionsTitleStyle') || ''}
                }
                #suggestionsContainer ul {
                    padding: 0;
                    ${this.getAttribute('suggestionsListStyle') || ''}
                }
                #suggestionsContainer li {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    padding: 8px;
                    cursor: pointer;
                    transition: .2s;
                    ${this.getAttribute('suggestionStyle') || ''}
                }
                #suggestionsContainer li span:last-of-type {
                    color: rgba(121, 121, 121, 0.7);
                    font-size: 0.85rem;
                    ${this.getAttribute('suggestionAddressStyle') || ''}
                }
                #suggestionsContainer li:hover {
                    background: rgba(121, 121, 121, 0.05);
                    ${this.getAttribute('suggestionHoverStyle') || ''}
                }
                #result {
                    margin-top: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    max-width: 50%;
                    min-width: 200px;
                    transition: .2s;
                    will-change: transform;
                    transform-origin: 100% 0%;
                    ${this.getAttribute('resultStyle') || ''}
                }
            </style>`;
    }

    async getSuggestions(query) {
        const token = this.getAttribute('apiKey');
        const res = await fetch(this.url, this.getAPIOptions(query, token));
        if (!res.ok) {
            throw new Error(res.statusText);
        }
        return await res.json();
    }

    showError(text) {
        const errorElement = this.root.getElementById('error');
        errorElement.innerText = `Не удалось получить данные. ${text}`;
        errorElement.style.opacity = 1;
        errorElement.style.transform = 'scale(1)';
    }

    hideError() {
        const errorElement = this.root.getElementById('error');
        errorElement.innerText = '';
        errorElement.style.opacity = 0;
        errorElement.style.transform = 'scale(0)';
    }

    showSuggestions() {
        const suggestionsContainer = this.root.getElementById('suggestionsContainer');
        const rootRect = this.getBoundingClientRect();
        suggestionsContainer.style.opacity = 1;
        suggestionsContainer.style.transform = 'scaleY(1)';
        suggestionsContainer.style.maxHeight = rootRect.height * 0.8 + 'px';
        if (rootRect.height < 300) {
            if (rootRect.top > 300) {
                suggestionsContainer.style.bottom = '100%';
                suggestionsContainer.style.top = 'unset';
                suggestionsContainer.style.maxHeight = rootRect.top + 'px';
            } else {
                if (window.innerHeight - 300 < rootRect.bottom) {
                    this.style.minHeight = '300px';
                    suggestionsContainer.style.maxHeight = 300 * 0.8 + 'px';
                } else {
                    suggestionsContainer.style.maxHeight = window.innerHeight - rootRect.bottom + 'px';
                }
            }
        }
        if (window.innerHeight - rootRect.bottom < 0) {
            suggestionsContainer.scrollIntoView();
        }
    }

    hideSuggestions() {
        this.style.minHeight = '';
        const suggestionsContainer = this.root.getElementById('suggestionsContainer');
        suggestionsContainer.style.opacity = 0;
        suggestionsContainer.style.transform = 'scaleY(0)';
    }

    handleInput = async (e) => {
        const value = e.target.value;
        try {
            const { suggestions } = await this.getSuggestions(value);
            const suggestionsList = this.root.getElementById('suggestionsList');

            suggestionsList.innerHTML = '';
            this.hideError();

            if (!suggestions.length) {
                this.hideSuggestions();
                return;
            }

            suggestions.forEach(s => {
                const suggestion = document.createElement('li');

                const title = document.createElement('span');
                title.innerText = s.value;

                const subTitle = document.createElement('span');
                subTitle.innerText = `${s.data.inn} ${s.data.address.value}`;

                suggestion.append(title, subTitle);

                suggestion.addEventListener('click', () => this.handleSuggestionSelect(s));
                suggestionsList.append(suggestion);
            });

            this.showSuggestions();

        } catch (error) {
            this.showError(error);
        }
    };

    handleBlur = (e) => {
        if (e?.relatedTarget?.id == 'suggestionsContainer') return;
        this.hideSuggestions();
        this.hideError();
    };

    handleManualDataChange = () => {
        const values = {
            'short_name': this.root.getElementById('short_name').value,
            'full_name': this.root.getElementById('full_name').value,
            'inn_kpp': this.root.getElementById('inn_kpp').value,
            'address': this.root.getElementById('address').value,
        };
        this.root.dispatchEvent(new CustomEvent('dadata_value_manually_changed', {
            bubbles: true,
            composed: true,
            detail: {
                id: this.getAttribute('id'),
                data: values
            }
        }));
    };

    handleSuggestionSelect(suggestion) {
        const { full_with_opf, short_with_opf } = suggestion.data.name;
        const { inn, kpp, type } = suggestion.data;
        const address = suggestion.data.address.unrestricted_value;

        const values = {
            'short_name': short_with_opf,
            'full_name': full_with_opf,
            'inn_kpp': `${inn} / ${kpp}`,
            'address': address,
        };

        Object.entries(this.resultElements).forEach(([key, elems]) => {
            if (key && elems) {
                elems.forEach(elem => {
                    if (elem.tagName === 'INPUT') {
                        elem.value = values[key];
                    } else {
                        elem.textContent = values[key];
                    }
                });
            }
        });

        this.root.getElementById('suggestionsInput').value = short_with_opf;

        const typeText = this.root.getElementById('typeText');
        typeText.innerText = `${this.typeTexts[type] || ''} (${type})`;
        typeText.hidden = false;

        this.root.dispatchEvent(new CustomEvent('dadata_value_changed', {
            bubbles: true,
            composed: true,
            detail: {
                id: this.getAttribute('id'),
                data: suggestion
            }
        }));
        this.handleBlur();

        if (this.getAttribute('hideResult')) {
            const result = this.root.getElementById('result');
            result.style.position = 'relative';
            result.style.opacity = 1;
            result.style.transform = 'scaleY(1)';
            result.scrollIntoView();
        }
    }

    connectedCallback() {
        this.root = this.attachShadow({ mode: 'closed' });

        this.root.innerHTML = this.getStyle();

        const label = document.createElement('label');

        label.style.fontWeight = 'bold';
        label.style.position = 'relative';
        label.style.gap = '10px';
        label.textContent = 'Компания или ИП';

        const input = document.createElement('input');
        input.id = 'suggestionsInput';
        input.placeholder = 'Введите название';

        input.addEventListener('input', this.handleInput);
        input.addEventListener('blur', this.handleBlur);

        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.tabIndex = 1;
        suggestionsContainer.id = 'suggestionsContainer';

        const suggestionsList = document.createElement('ul');
        suggestionsList.id = 'suggestionsList';

        const suggestionsTitle = document.createElement('p');
        suggestionsTitle.textContent = 'Выберите вариант или продолжите ввод';
        suggestionsTitle.id = 'suggestionsTitle';

        suggestionsContainer.append(suggestionsTitle, suggestionsList);

        label.append(input, suggestionsContainer);

        const errorElement = document.createElement('span');
        errorElement.id = 'error';

        const result = document.createElement('div');
        result.id = 'result';

        if (this.getAttribute('hideResult')) {
            result.style.opacity = 0;
            result.style.transform = 'scaleY(0)';
            result.style.position = 'absolute';
        }

        const typeText = document.createElement('p');
        typeText.id = 'typeText';
        typeText.hidden = true;

        result.append(typeText);

        Object.entries(this.inputNames).forEach(([name, text]) => {

            const slotWrapper = document.createElement('div');
            slotWrapper.className = 'inputSlotWrapper';

            const slot = document.createElement('slot');
            slot.name = name;

            const label = document.createElement('label');
            label.textContent = text;

            const input = document.createElement('input');
            input.placeholder = `Введите ${text.toLowerCase()}`;
            input.autocomplete = 'off';
            input.id = name;
            input.className = 'result';
            input.addEventListener('change', this.handleManualDataChange);

            label.append(input);

            slot.append(label);

            slotWrapper.append(slot);

            result.append(slotWrapper);

            setTimeout(() => {
                const customResultElems = slot.assignedElements({ flatten: true })
                    .filter(el => el.classList.contains('result'));
                const defaultResultEl = [input];
                const resultEls = customResultElems.length ? customResultElems : defaultResultEl;
                this.resultElements[name] = resultEls;
            });
        });

        const defaultSlot = document.createElement('slot');

        this.root.append(label, errorElement, result, defaultSlot);
    }

});

