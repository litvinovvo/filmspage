
function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}

escapeForHTML = s => s.replace(/[&<]/g, c => c === '&' ? '&amp;' : '&lt;');

class Comment {
    constructor({author,text,film_id,title,rate}){
        this.author = escapeForHTML(author)
        this.text = text ? escapeForHTML(text):'Автор не оставил подробной рецензии'
        this.title = escapeForHTML(title)
        this.film_id = film_id
        this.rate = rate
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
        this.activeTrailerId = null
        this.watchEvents()
    }

    watchEvents(){
        const filterEl = document.querySelector('.film-filter__list')
        const filmsEl = document.querySelector('.film__list')
        filterEl.addEventListener('click',(e) => this.clickOnTag(e))
        filmsEl.addEventListener('click',(e) => this.clickOnFilm(e))
        filmsEl.addEventListener('submit',(e) => this.submitForm(e))
        filmsEl.addEventListener('click',(e) => this.clickOnPlay(e))
        filmsEl.addEventListener('click',(e) => this.clickOnPause(e))
    }

    submitForm(e){
        e.preventDefault()
        
        const target = e.target
        console.log(target.rate.value)
        this.comments.push(new Comment({
            author: target.name.value,
            text: target.text.value,
            title: target.title.value,
            film_id: target.film.value,
            rate: target.rate.value
        }))
        this.renderFilmArticle(this.activeFilmId)
    }
    clickOnPause(e){
        const filmPrePause = e.target.closest(".film-pre__pause")
        
        if(!filmPrePause)return
        const filmPreEl = e.target.closest("[data-id]")
        
        if(!filmPreEl || !filmPreEl.dataset || !filmPreEl.dataset.id)return
        this.pauseTrailer(filmPreEl.dataset.id)
    }
    
    pauseTrailer(id){
        const filmsEl = document.querySelector('.film__list')
        const filmPreEl = filmsEl.querySelector(`[data-id="${id}"]`)
        
        if(!filmPreEl || !filmPreEl.dataset || !filmPreEl.dataset.id)return
        const filmPreContent = filmPreEl.querySelector('.film-pre__content')
        const filmPrePause = filmPreEl.querySelector(".film-pre__pause")
        if(filmPreContent)filmPreContent.classList.remove('film-pre__content_hidden')
        const videoPreEl = filmPreEl.querySelector('video')
        if(!videoPreEl)return
        const filmPrePlay = filmPreEl.querySelector(".film-pre__play")
        filmPreEl.classList.remove('film-pre_show-video')
        filmPrePause.classList.toggle('hidden')
        filmPrePlay.classList.toggle('hidden')
        videoPreEl.pause()
        this.activeTrailerId = null        
    }
    
    clickOnPlay(e){
        const filmPrePlay = e.target.closest(".film-pre__play")
        
        if(!filmPrePlay)return
        const filmPreEl = e.target.closest("[data-id]")
        
        if(!filmPreEl || !filmPreEl.dataset || !filmPreEl.dataset.id)return
        const filmPreContent = filmPreEl.querySelector('.film-pre__content')
        if(filmPreContent)filmPreContent.classList.add('film-pre__content_hidden')
        const videoPreEl = filmPreEl.querySelector('video')
        if(!videoPreEl)return
        const filmPrePause = filmPreEl.querySelector(".film-pre__pause")
        filmPreEl.classList.add('film-pre_show-video')
        filmPrePause.classList.toggle('hidden')
        filmPrePlay.classList.toggle('hidden')
        videoPreEl.classList.remove('hidden')
        if(this.activeTrailerId)this.pauseTrailer(this.activeTrailerId)
        videoPreEl.play()
        this.activeTrailerId = filmPreEl.dataset.id
    }


    clickOnFilm(e){
        const filmPrePlay = e.target.closest(".film-pre__play")
        const filmPrePause = e.target.closest(".film-pre__pause")
        if(filmPrePlay || filmPrePause)return

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

        function renderRate(rate){
            let rateStr = '';
            for(let r=1;r<6;r++){
                rateStr+= rate < r ? `<i class="far fa-star"></i>` : `<i class="fas fa-star"></i>`
            }
            return rateStr
        }

        for(let c of comments){
            commentsStr +=`
            <article class="film__review">
            <header>
                <div class="review__author">${c.author}</div>
                <h4 class="review__title">${c.title}</h4>
                <div class="review__rate">${renderRate(c.rate)}</div>
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
                <label class="new-review__label">Ваша оценка</label>
                <div class="new-review__rate">
                    <input class="hidden" type="radio" name="rate" id="rate1" value="1">
                    <input class="hidden" type="radio" name="rate" id="rate2" value="2">
                    <input class="hidden" type="radio" name="rate" id="rate3" checked value="3">
                    <input class="hidden" type="radio" name="rate" id="rate4" value="4">
                    <input class="hidden" type="radio" name="rate" id="rate5" value="5">

                    <label for="rate1" class="star">  
                        <i class="far fa-star"></i>
                    </label>

                    <label for="rate2" class="star">  
                        <i class="far fa-star"></i>
                    </label>
                    
                    <label for="rate3" class="star">  
                        <i class="far fa-star"></i>
                    </label>

                    <label for="rate4" class="star">  
                        <i class="far fa-star"></i>
                    </label>
                    
                    <label for="rate5" class="star">  
                        <i class="far fa-star"></i>
                    </label>
                </div>


                <label class=" new-review__label" for="name">Имя</label>
                <input required autocomplete="off" class="input new-review__input" type="text" name="name" id="name" placeholder="Иван Иванов" minlength="2">
                <span class="input-helper"></span>
                <label class=" new-review__label" for="title">Заголовок</label>
                <input required autocomplete="off" class="input new-review__input" type="text" name="title" id="title" placeholder="Коротко о фильме" minlength="2">               <span class="input-helper"></span> 
                <label class=" new-review__label" for="text">Текст</label>
                <textarea autocomplete="off" class="input new-review__textarea" name="text" id="text" placeholder="Ваша рецензия" ></textarea>
                <span class="input-helper"></span>
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
        this.activeTrailerId = null 
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
                    <video class="film-pre__video hidden" onloadstart="this.volume=0.2" src="${film.trailer}" preload="auto" poster="${film.poster}" loop>
                </div>
                <div class="film-pre__content">
                    <i class="film-pre__play" title="Play trailer"></i>
                    <i class="film-pre__pause hidden" title="Pause trailer"></i>
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
