
function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}

escapeForHTML = s => s.replace(/[&<]/g, c => c === '&' ? '&amp;' : '&lt;');

class Comment {
    constructor({author,text,film_id,title}){
        this.author = escapeForHTML(author)
        this.text = text ? escapeForHTML(text):'Автор не оставил подробной рецензии'
        this.title = escapeForHTML(title)
        this.film_id = film_id
        this.id = Comment.generateId()
    }
    static generateId(){
        return '_' + Math.random().toString(36).substr(2, 9)
    }
}

class App {
    constructor(data){
        this.tags = data.tags
        this.films = data.films
        this.comments = data.comments
        
        this.activeTagId = null
        this.activeFilmId = null

        this.watchEvents()
    }

    watchEvents(){
        const filterEl = document.querySelector('.film-filter__list')
        const filmsEl = document.querySelector('.film__list')
        filterEl.addEventListener('click',(e) => this.clickOnTag(e))
        filmsEl.addEventListener('click',(e) => this.clickOnFilm(e))
        filmsEl.addEventListener('submit',(e) => this.submitForm(e))
    }

    submitForm(e){
        e.preventDefault()
        const target = e.target
        this.comments.push(new Comment({
            author: target.name.value,
            text: target.text.value,
            title: target.title.value,
            film_id: target.film.value
        }))
        this.renderFilmArticle(this.activeFilmId)
    }

    clickOnFilm(e){
        const filmsEl = document.querySelector('.film__list')
        const filmPreEl = e.target.closest("[data-id]")
        
        const selectedEl = filmsEl.querySelector('.film-pre_selected')

        if(!filmPreEl || !filmPreEl.dataset || !filmPreEl.dataset.id)return
        if(filmPreEl.dataset.id === this.activeFilmId){
            if(selectedEl)selectedEl.classList.remove("film-pre_selected")
            this.removeArticleEl()
            this.activeFilmId = null
            return
        }
        
        if(selectedEl)selectedEl.classList.remove("film-pre_selected")
        filmPreEl.classList.add("film-pre_selected")
        this.activeFilmId = filmPreEl.dataset.id
        this.renderFilmArticle(this.activeFilmId)

    }

    removeArticleEl(){
        const filmsEl = document.querySelector('.film__list')
        const filmArticleEl = filmsEl.querySelector('.film')
        if(filmArticleEl)filmArticleEl.remove()
    }

    renderFilmArticle(id){
        this.removeArticleEl()
        const filmsEl = document.querySelector('.film__list')
        const filmPreEl = filmsEl.querySelector(`[data-id="${id}"`)
        const filmArticleEl = document.createElement("div");
        filmArticleEl.classList.add("col-md-12", "film")
        const film = this.films.filter((f)=>f.id + '' === id + '')
        let commentsStr = '';
        const comments = this.comments.filter((c) => c.film_id + '' === id + '')

        for(let c of comments){
            commentsStr +=`
            <article class="film__review">
            <header>
                <div class="review__author">${c.author}</div>
                <h4 class="review__title">${c.title}</h4>
                
            </header>
                <p>${c.text}</p>
            </article>
            <hr class="review__hr"> 
            `               
        }

        filmArticleEl.innerHTML = `
        <article>
        <header>
                <h2 class="film__title">${film[0].title}</h2>
        </header>
            
            <p class="film__description">${film[0].synopsis}</p>
        <section>
                <a href="#" class="link film__all-reviews">все рецензии на фильм</a>
                <h3 class="film__header">Лучшие рецензии</h3>
                ${commentsStr ? commentsStr : "Ещё нет комментариев" }       
        </section>
        </article>
        <div class="film__new-review new-review">
        <h3 class="film__header">Поделитесь своим мнением!</h3>
        <form action="#" method="POST">
                <input id="film" name="film" type="hidden" value="${film[0].id}">
                
                <label class=" new-review__label" for="name">Имя</label>
                <input required class="input new-review__input" type="text" name="name" id="name" placeholder="Ваше имя">
                <label class=" new-review__label" for="title">Заголовок</label>
                <input required class="input new-review__input" type="text" name="title" id="title" placeholder="Коротко о фильме">                
                <label class=" new-review__label" for="text">Текст</label>
                <textarea class="input new-review__textarea" name="text" id="text" placeholder="Ваша рецензия" ></textarea>
                <input class="new-review__btn" type="submit" value="Отправить">                                          
            </form>
        </div>    
        `
        insertAfter(filmArticleEl,filmPreEl)

    }

    clickOnTag(e){
        const containerEl = document.querySelector('.film-filter__list')
        const tagEl = e.target.closest("[data-id]")
        if(!tagEl || !tagEl.dataset || !tagEl.dataset.id)return
        if(tagEl.dataset.id === this.activeTagId)return
        if(this.activeTagId){
            containerEl.querySelector(`[data-id="${this.activeTagId}"]`).classList.remove('film-filter__link_active')
        }
        this.activeTagId = tagEl.dataset.id
        tagEl.classList.add('film-filter__link_active')

        this.renderFilmList()   
        this.activeFilmId = null     
    }

    selectTag(id){
        if(id === this.activeTagId)return

        const containerEl = document.querySelector('.film-filter__list')
        const tagEl = containerEl.querySelector(`[data-id="${id}"`)

        if(!tagEl){
            console.warn('no such tag id',id)
            return
        }

        if(this.activeTagId){
            containerEl.querySelector(`[data-id="${this.activeTagId}"]`).classList.remove('film-filter__link_active')
        }
        this.activeTagId = id
        tagEl.classList.add('film-filter__link_active')
        this.renderFilmList()   
        this.activeFilmId = null           
    }

    renderTags(){
        const containerEl = document.querySelector('.film-filter__list')
        containerEl.innerHTML = ''
        for(let tag of this.tags){
            containerEl.innerHTML+=`<li class="film-filter__list-item"><a data-id=${tag.id} class="film-filter__link" href="#">${tag.name}</a></li>`
        }
    }

    renderFilmList(){
        const filmList = this.films.filter((f)=>~f.tags.indexOf(this.activeTagId))
        const containerEl = document.querySelector('.film__list')
        containerEl.innerHTML = ''
        for(let film of filmList){
            containerEl.innerHTML += `
            <div class="col-md-12 film-pre" data-id=${film.id}>
                <div class="film-pre__background" style="background-image: url(${film.poster});">
                </div>
                <div class="film-pre__content">
                    <h3 class="film-pre__title">${film.title}</h3>
                    <p class="film-pre__subtitle">
                    ${film.short_synopsis}
                    </p>
                </div>
            </div>`             
        }
    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const app = new App(data)
    app.renderTags()
    app.selectTag("000001")
})
