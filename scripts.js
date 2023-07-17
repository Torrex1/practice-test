let lists;
let filters = undefined;
let searchValue = '';

const modalCards = document.querySelector('.modalCards');

const ed_card = document.querySelector('.wrapper_body');

async function json_file() {
    let resp = await fetch('campaign.json');
    return await resp.json();
}

function render() {
    let buffer = '';

    for (let listId in lists) {
        let listItem = lists[listId];

        if (!listItem.name.toLowerCase().includes(searchValue.toLowerCase())) continue;

        for (let groupId in listItem.groups) {
            let group = listItem.groups[groupId];

            if (!filterGroup(group)) continue;

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
                            </tr>
                        </table>
                    </div>
                </div>`
        }
    }
    ed_card.innerHTML = buffer;

    document.querySelectorAll('.card-name').forEach(name => {
        document.querySelectorAll('.speciality-card').forEach(card => {

            const checkbox = document.querySelector('.checkboxCard');
            name.addEventListener('click', () => {
                if (card.contains(name)) {

                    // запрет на выделение текста
                    name.addEventListener('selectstart', function (event) {
                        event.preventDefault();
                        return false;
                    })

                    // работа вне модального окна
                    if (ed_card.contains(card)) {
                        // ограничение на количество карточек
                        if (modalCards.childElementCount < 3) {
                            modalCards.append(card);
                        } else {
                            alert('Можно выбрать не больше 3 направлений!');
                        }
                    }

                    // работа в модальном окне
                    if (modalCards.contains(card)) {

                        document.querySelector('#modal_text').style.display = 'none';
                        checkbox.removeAttribute('disabled');

                        // добавление стиля карточкам
                        name.addEventListener('click', () => {
                            card.classList.toggle('card-color');
                        })

                        // добавление атрибута на чекбокс
                        checkbox.addEventListener('click', (event) => {
                            event.target.setAttribute('checked', event.target.getAttribute('checked') !== 'true');
                        })

                        // снятие флажка у checkbox при выходе из модального окна
                        document.querySelector('.modal').addEventListener('hidden.bs.modal', () => {
                            checkbox.checked = false;
                            if (checkbox.checked === false)
                                card.classList.remove('card-color');

                            if (modalCards.childElementCount === 0) {
                                checkbox.setAttribute('disabled', "");
                            }
                        })

                        // при клике на флашок, выделяются все карточки
                        checkbox.addEventListener('click', () => {
                            if (checkbox.checked === true) {
                                card.classList.add('card-color');
                            } else {
                                card.classList.remove('card-color');
                            }
                        })

                        //удаление карточки из модального окна
                        document.querySelector('.removeCard').addEventListener('click', () => {
                            if (getComputedStyle(card).backgroundColor) {
                                card.classList.remove('card-color');
                                ed_card.insertBefore(card, document.querySelector('.speciality-card'));
                            }
                        })
                    }
                }
            });

        })
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

            if (group[filtersKey])
                flags["form_group"] = true;

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
                                                // ***temp trash***

// if (card.contains(name)) {
//     let checkbox_input = document.createElement('input');
//     checkbox_input.style.position = 'relative';
//     checkbox_input.style.top = '20px';
//
//     // проверка являестя ли карточка дочерним элементом (не модального окна)
//     if (ed_card.contains(card)) {
//
//         // создание checkbox для каждой карточки
//         checkbox_input.type = 'checkbox';
//
//         modalCards.append(checkbox_input, card);
//     }
//
//     if (!modalCards.contains(card)) {
//         console.log(card);
//     }
//     // установка для каждого checkbox атрибута checked (если кнопка нажата, ей присвается атрибут checked
//     checkbox_input.addEventListener('change', () => {
//         checkbox_input.toggleAttribute('checked');
//     })
//
//     document.querySelector('.select_allCard').addEventListener('change', () => {
//         document.querySelector('.select_allCard').toggleAttribute('checked');
//     })
//
//     // установка атрибута для checkbox, который выделяет все карточки
//     // document.querySelector('.select_allCard').addEventListener('change', () => {
//     //     checkbox_input.toggleAttribute('checked');
//     // });
//
//
//     // удаление карточки при нажатом checkbox
//     document.querySelector('.removeCard').addEventListener('click', () => {
//         if (checkbox_input.hasAttribute('checked')) {
//             checkbox_input.remove();
//             ed_card.append(card);
//         }
//     })
//     document.querySelector('#modal_text').style.display = 'none';
// }




//trash #2

