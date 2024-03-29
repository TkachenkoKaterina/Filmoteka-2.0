import {
  API_KEY,
  MAIN_PART_URL,
  BASE_IMG_URL,
  GENRE_REQUEST_PART,
  SEARCH_MOVIE,
  MOBILE_STUB,
  TABLET_STUB,
  DESKTOP_STUB,
  MOBILE_SIZES,
  TABLET_SIZES,
  DESKTOP_SIZES,
  ADULT,
  ALL_GENRES,
  GENRES_ARR_KEY,
} from './vars';
import { requestGet } from './requestGet';
import { pagination, changePage } from './tuiPagination';
var debounce = require('lodash.debounce');
import Notiflix from 'notiflix';

const formEl = document.querySelector('#search-form');
const inputEl = document.querySelector('.header__search-input');
const buttonEl = document.querySelector('.header__search-button');
const divEl = document.querySelector('.header__error-text--disable');
const ulEl = document.querySelector('.movie__collection');

buttonEl.classList.add('disebl_button_form');
let valuelongth = 0;
let valuesString = '';
const DEBOUNCE_DELAY = 300;
let namberPer_page = 40;
let namberPage = 1;
let datatotalHits = 0;
let pageTotal = 0;
let AllGenres = [];
localStorage.removeItem(GENRES_ARR_KEY);
//__________________________GET GENRES ARR_______________________

requestGet(MAIN_PART_URL, GENRE_REQUEST_PART, API_KEY)
  .then(res => res)
  .then(resl => resl.data)
  .then(resalts => {
    localStorage.setItem(GENRES_ARR_KEY, JSON.stringify(resalts.genres));
    if (JSON.parse(localStorage.getItem(GENRES_ARR_KEY)) !== null) {
      AllGenres = JSON.parse(localStorage.getItem(GENRES_ARR_KEY));
    } else {
      AllGenres = ALL_GENRES;
    }
  })
  .catch(err => {
    console.log(err);
  });
//-----------------------------------------------------------------------------------------------------------------------------------------
function searchGenres(arrays, lengthArr) {
  let count = lengthArr;
  let stat = 0;
  let strRes = '';
  if (lengthArr > 3) {
    lengthArr = 3;
    count = 3;
    stat = 1;
  }
  if (lengthArr === 0) {
    return 'Other';
  } else {
    for (let index = 0; index < lengthArr; index++) {
      count = count - 1;
      ALL_GENRES.map(ALL_GENRE => {
        if (arrays[index] === ALL_GENRE.id) {
          if (count === 0) {
            if (stat === 1) {
              strRes += 'Other';
            } else {
              strRes += ALL_GENRE.name;
            }
          } else {
            strRes += ALL_GENRE.name + ', ';
          }
        } else {
        }
      });
    }
  }
  return strRes;
}
//----------------------------------------------------------------------------------------------------------------------------------
export function noFoto(base_url, width, img_file, stub) {
  let strM = '';
  img_file === null ? (strM = stub) : (strM = `${base_url}${width}${img_file}`);
  return strM;
}
//----------------------------------------------------------------------------------------------------------------------------
const articleElement = articls => {
  return articls
    .map(({ id, original_title, poster_path, release_date, genre_ids }) => {
      return `<li class="movie__card">
              <div class="movie__img__box">
          <picture class="film-list__img">
                    <source
                      srcset="${noFoto(
                        BASE_IMG_URL,
                        DESKTOP_SIZES,
                        poster_path,
                        DESKTOP_STUB
                      )}"
                      media="screen and (min-width:1280px)"
                    />
                    <source
                      srcset="${noFoto(
                        BASE_IMG_URL,
                        TABLET_SIZES,
                        poster_path,
                        TABLET_STUB
                      )}"
                      media="(min-width:768px)"
                    />
                    <source
                      srcset="${noFoto(
                        BASE_IMG_URL,
                        MOBILE_SIZES,
                        poster_path,
                        MOBILE_STUB
                      )}"
                      media="(max-width:767px)"
                    />
                    <img
              class="movie__img" data-id="${id}"
              src="./images/no-Film-Img.jpg"
              alt="Постер до фільму"
              width="264"
              height="374"
              name="Poster"
            />
                  </picture>           
          </div>
          <div class="movie__card__textbox">
            <h3 class="movie__title">${original_title}</h3>
            <span class="movie__details">${searchGenres(
              Object.values(genre_ids),
              genre_ids.length
            )} | </span>
            <span class="movie__details">${release_date.slice(0, 4)}</span>
            </div>
      </li> `;
    })
    .join('');
};
//------------------------------------------------------------------------------------------------------------------------------------------------------------
const onInput = event => {
  event.preventDefault();
  //formEl.removeEventListener('submit', onInput);
  divEl.classList.add('header__error-text--disable');
  valuelongth = event.target.value.length;
  valuesString = event.target.value;
  let element = '';
  for (let index = 0; index < valuelongth; index++) {
    element = element + ' ';
  }
  if (valuesString === element) {
    return (valuesString = '');
  } else {
    if (buttonEl.classList.contains('disebl_button_form')) {
      buttonEl.classList.remove('disebl_button_form');
    }
  }
};

inputEl.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));

//------------------------------------------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------------------------------------------
const searchFilm = async event => {
  event.preventDefault();
  inputEl.removeEventListener('input', debounce(onInput, DEBOUNCE_DELAY));
  try {
    if (event.currentTarget.elements[0].value !== '') {
      if (event.currentTarget.elements[0].value.length > valuelongth) {
        valuesString = event.currentTarget.elements[0].value;
      }
    }
    if (valuesString === '') {
      return alert(
        'Sorry, there are no films matching your search query. Please try again.'
      );
    }
    namberPage = 1;
    valuesString = valuesString.trim();
    valuesString = '&query=$' + valuesString;
    requestGet(MAIN_PART_URL, SEARCH_MOVIE, API_KEY, ADULT, valuesString).then(
      res => {
        if (res.data.total_pages > 1) {
          pagination(res.data.total_pages, res.data.page);
        }
        const articls = res.data.results;
        datatotalHits = res.data.total_results;
        pageTotal = res.data.total_pages;
        if (datatotalHits === 0) {
          divEl.classList.remove('header__error-text--disable');
          Notiflix.Notify.failure(
            'Search result not successful. Enter the correct movie name.'
          );
          return;
        } else {
          ulEl.innerHTML = articleElement(articls);
        }
      }
    );
  } catch (error) {
    console.log(error);
    console.log(error.value);
    console.log(error.message);
  }
};

formEl.addEventListener('submit', searchFilm);
//-------------------------------------------------------------------------------------------------
