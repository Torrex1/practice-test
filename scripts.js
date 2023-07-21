let lists;
let filters = undefined;
let searchValue = '';

const modalCards = document.querySelector('.modalCards');
const ed_card = document.querySelector('.wrapper_body');

async function json_file() {
    let resp = await fetch('campaign.json');
    return await resp.json();
}

// создание уведомления
function alertCreate() {
    let alert = document.createElement('div');
    alert.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show');
    alert.setAttribute('role', 'alert');
    alert.innerText = 'Нельзя выбрать больше 3-х специальностей!';

    let closeAlert = document.createElement('button');
    closeAlert.classList.add('btn-close', 'shadow-none');
    closeAlert.setAttribute('type', 'button');
    closeAlert.setAttribute('data-bs-dismiss', 'alert');
    closeAlert.setAttribute('aria-label', 'Close');

    alert.append(closeAlert);
    document.querySelector('#alertContainer').append(alert);
}

function render() {
    let buffer = '';

    for (let listId in lists) {
        let listItem = lists[listId];

        if (!listItem.name.toLowerCase().includes(searchValue.toLowerCase())) continue;

        for (let groupId in listItem.groups) {
            let group = listItem.groups[groupId];

            if (!filterGroup(group))
                continue;

            buffer += `
                <div class="speciality-card" id="${group.id}">
                    <h5 class="card-name">${listItem.name}</h5>
                        <table class="table-card">
                            <tr>
                                <th>Обязательные экзамены:</th>
                                <th>Экзамены по выбору:</th>
                                <th>Мест:</th>
                                <th>Тип обучения:</th>
                                <th>Форма обучения:</th>
                            </tr>
                            <tr>
                                <td>Русский, Математика</td>
                                <td>Информатика, Физика</td>
                                <td>${group.quantity}</td>
                                <td id="edu_type">${group.type}</td>
                                <td id="edu_form">${group.education_form}</td>
                                <td id="dot" hidden>${group.dot}</td>
                            </tr>
                        </table>
                    </div>
                </div>`

        }
    }
    ed_card.innerHTML = buffer;
    setIcon();

    setCards()
}

const toastContent = document.querySelector('.toast');
const toastButton = document.querySelector('#toast-button');

function showToast() {
    const toast = new bootstrap.Toast(toastContent);
    toast.show();
}

const checkbox = document.querySelector('.checkboxCard');
function setCards() {

    document.querySelectorAll('.speciality-card').forEach(card => {
        document.querySelector('.addCard').addEventListener('click', () => {
            for (let listId in lists) {
                let listItem = lists[listId];

                for (let groupId in listItem.groups) {
                    let group = listItem.groups[groupId];

                        // добавление карточки в модальное окно
                    if (modalCards.childElementCount < 3 && card.hasAttribute('selected')) {
                        modalCards.append(card);
                        card.classList.remove('card-color');
                        card.removeAttribute('selected');
                        checkbox.removeAttribute('disabled');
                        document.querySelector('#modal_text').style.display = 'none';

                        // проверка на совпадение имен карточек с именами в модальном окне при добавлении
                    } else if (card.id === group.id) {
                        modalCards.querySelectorAll('.speciality-card').forEach(modal_card => {

                            if (modal_card.querySelector('.card-name').textContent === listItem.name) {
                                if (card.hasAttribute('selected')) {
                                    modalCards.append(card);
                                    card.classList.remove('card-color');
                                }
                            }
                        })
                    }
                }
            }
        })
        document.querySelectorAll('.card-name').forEach(name => {

            // запрет на выделение текста
            card.addEventListener('selectstart', (event) => {
                event.preventDefault();
                return false;
            })


            if (card.contains(name)) {
                name.addEventListener('click', (event) => {
                    card.classList.toggle('card-color');
                    card.toggleAttribute('selected');
                })
            }

            // обработчик события при закрытии модального окна
            document.querySelector('.modal').addEventListener('hidden.bs.modal', () => {
                checkbox.checked = false;
                card.classList.remove('card-color');
            })

            // обработчик события при открытии модального окна
            document.querySelector('.modal').addEventListener('shown.bs.modal', () => {

                // обработчик нажатия на checkbox
                checkbox.addEventListener('click', () => {

                    if (checkbox.checked && modalCards.contains(card)) {
                        card.classList.add('card-color');
                        card.setAttribute('selected', "");
                    } else {
                        card.classList.remove('card-color');
                        card.removeAttribute('selected');
                    }
                })

                // обработчик кнопки удаления карточек
                document.querySelector('.removeCard').addEventListener('click', () => {
                    if (card.hasAttribute('selected')) {
                        card.classList.remove('card-color');
                        card.remove();
                        card.removeAttribute('selected');
                        ed_card.insertBefore(card, document.querySelector('.speciality-card'));
                    }

                    // снятие флажка при отсутсвии карточек в модальном окне
                    if (modalCards.childElementCount === 0) {
                        checkbox.checked = false;
                        checkbox.setAttribute('disabled', "");
                        document.querySelector('#modal_text').style.display = '';
                    }
                })

            })

        })
    })
}

function setIcon() {
    document.querySelectorAll('.speciality-card').forEach(card => {
        if (card.innerHTML.includes('true')) {
            let image = document.createElement('img');
            image.src = 'assets/icon-distance-education.png';
            image.classList.add('icon-style');
            image.setAttribute('title', 'обучение с использованием дистанционных образовательных технологий (ДОТ)');
            card.append(image);
        }
    })
}

function filterGroup(group) {
    let flags = {
        "type_order" : false,
        "form_group" : false,
        "preparation_level" : false
    };

    for (const filtersKey in filters) {
        if (filtersKey !== 'dot') {
            let value = filters[filtersKey];

            if (value.includes(group[filtersKey]) || value.length === 0)
                flags[filtersKey] = true;
        } else {

            let value = filters[filtersKey];

            if (group[filtersKey]) {
                flags["form_group"] = true;
            }

            if (value === false)
                continue;

            if (group[filtersKey] === false && filters["form_group"].length === 0)
                flags["form_group"] = false;
        }
    }
    return flags["type_order"] && flags["form_group"] && flags["preparation_level"];
}

function arrayStrToNumbers(filterValues) {
    filterValues = filterValues.map((value) => {
        if (!isNaN((Number.parseInt(value))))
            return Number.parseInt(value);

        return value
    });

    return filterValues;
}

function filterEvent(event) {
    filters = {
        "type_order" : [],
        "form_group" : [],
        "dot" : false,
        "preparation_level" : []
    };

    event.target.setAttribute('state', event.target.getAttribute('state') !== 'true');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.getAttribute('state') === 'true') {
            if (btn.dataset.filterType !== 'dot') {
                let filterValues = arrayStrToNumbers(btn.dataset.filter.split(','));

                filters[btn.dataset.filterType] = filters[btn.dataset.filterType].concat(filterValues);
            } else {
                filters[btn.dataset.filterType] = !filters[btn.dataset.filterType];

            }
        }
    })
    render();
}

// обработчик кнопок фильтрации
function filterHandler() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', filterEvent);
    });
}

// реализация поиска на странице
function searchHandler() {
    document.querySelector('.search-field').addEventListener('input', (event) => {
        searchValue = event.target.value.trim();
        render();
    });
}


// создание текста, который показывается, если не выбран ни один из фильров
function buildText() {
    const spanText = document.createElement('span');
    spanText.className = "unpressed_filterBtn";
    spanText.innerText = "Выберите один из фильтров, чтобы увидеть специальности";
    ed_card.append(spanText);
}

function wrapper_body_title() {
    const eduTitle = document.createElement('span');
    eduTitle.id = 'wrapper_body-title';
    eduTitle.innerText = "Выберите специальность:";
    ed_card.prepend(eduTitle);
}

// функция скрытия и отображения текста и загаловка на странице
function hide_show_text() {
    buildText();
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!ed_card.contains(document.querySelector('.unpressed_filterBtn'))) {
                wrapper_body_title();
            }
        })
    })
}

async function init() {
    lists = await json_file();

    searchHandler();
    filterHandler();
    hide_show_text();

}
init();
