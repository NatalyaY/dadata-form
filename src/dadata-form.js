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
    }

    getStyle() {
        return `<style>
                :host {
                    width: 100%;
                    max-width: 800px;
                    display: block;
                    ${this.getAttribute('hostStyle') || ''}
                }
                * {
                    font-family: inherit;
                    margin: 0;
                    box-sizing: border-box;
                }
                label {
                    width: 100%;
                    max-width: 100%;
                    display: flex;
                    flex-direction: column;
                    ${this.getAttribute('labelStyle') || ''}
                }
                input {
                    max-width: 100%;
                    border: 1px solid transparent;
                    outline: none;
                    padding: 10px 15px;
                    border-radius: 8px;
                    background: rgba(121, 121, 121, 0.05);
                    color: inherit;
                    font-size: 1rem;
                    transition: 0.2s;
                    ${this.getAttribute('inputStyle') || ''}
                }
                input:hover {
                    border-color: rgba(121, 121, 121, 0.5);
                    ${this.getAttribute('inputHoverStyle') || ''}
                }
                input:focus {
                    border-color: rgba(121, 121, 121, 0.7);
                    background: transparent;
                    ${this.getAttribute('inputFocusStyle') || ''}
                }
                input:not(:placeholder-shown) {
                    background: transparent;
                    border-color: rgba(121, 121, 121, 0.05);
                    ${this.getAttribute('inputFilledStyle') || ''}
                }
                input::placeholder {
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
        suggestionsContainer.style.opacity = 1;
        suggestionsContainer.style.transform = 'scaleY(1)';
    }

    hideSuggestions() {
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

        this.root.getElementById('short_name').value = short_with_opf;
        this.root.getElementById('full_name').value = full_with_opf;
        this.root.getElementById('inn_kpp').value = `${inn} / ${kpp}`;
        this.root.getElementById('address').value = address;
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

        const typeText = document.createElement('p');
        typeText.id = 'typeText';
        typeText.hidden = true;

        result.append(typeText);

        Object.entries(this.inputNames).forEach(([name, text]) => {
            const label = document.createElement('label');
            label.textContent = text;

            const input = document.createElement('input');
            input.placeholder = `Введите ${text.toLowerCase()}`;
            input.autocomplete = 'off';
            input.id = name;
            input.addEventListener('change', this.handleManualDataChange);

            label.append(input);
            result.append(label);
        });

        this.root.append(label, errorElement, result);
    }

});
