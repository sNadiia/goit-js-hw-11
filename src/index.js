import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import debounce from 'lodash.debounce';
const DEBOUNCE_DELAY = 500;

let galleryLightBox = new SimpleLightbox('.gallery .photo-card-link', {
  widthRatio: 0.8,
  heightRatio: 0.8,
  animationSpeed: 250,
  // scaleImageToRatio: true,
});

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

const key = `36503211-5a6b1020ee80a2c92835fdd88`;

const searchParams = new URLSearchParams({
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 40,
});

class PhotoService {
  constructor() {
    this.page = 1;
    this.searchValue = '';
  }

  async getPhoto() {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${key}&q=${this.searchValue}&${searchParams}&page=${this.page}`
    );
    this.incrementPage();
    return response;
  }

  resetPage() {
    this.page = 1;
  }

  incrementPage() {
    this.page += 1;
  }
}

const photoService = new PhotoService();

class LoadMoreBtn {
  constructor({ selector }) {
    this.button = this.getButton(selector);
  }

  getButton(selector) {
    return document.querySelector(selector);
  }

  hide() {
    this.button.hidden = true;
  }

  show() {
    this.button.hidden = false;
  }

  disable() {
    this.button.disabled = true;
    this.button.textContent = 'Loading...';
  }

  enable() {
    this.button.disabled = false;
    this.button.textContent = 'Load more';
  }
}

const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
});

loadMoreBtn.hide();

form.addEventListener('submit', onSubmit);
// loadMoreBtn.button.addEventListener('click', fetchPhotos);

function onSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const value = form.elements.searchQuery.value.trim();

  if (value === '') Notify.failure('No value!');
  else {
    photoService.searchValue = value;
    photoService.resetPage();
    clearPhotoGallery();
    form.reset();
    getPhotoMarkup();
    window.addEventListener('scroll', handleScrollDeb);
    // loadMoreBtn.show();
  }
}

async function getPhotoMarkup() {
  try {
    const response = await photoService.getPhoto();
    const arrayPhotos = response.data.hits;

    if (arrayPhotos.length === 0) {
      loadMoreBtn.hide();
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return '';
    } else {
      showTotalHits(response.data.totalHits);
      const markuplist = arrayPhotos.reduce(
        (markup, photo) => markup + createMarkup(photo),
        ''
      );
      updatePhotoGallery(markuplist);
      addStatusLoadMoreBtn(arrayPhotos.length);
      galleryLightBox.refresh();
    }
  } catch (err) {
    onError(err);
  }
}

async function fetchPhotos() {
  try {
    window.addEventListener('scroll', handleScrollDeb);
    loadMoreBtn.disable();
    const response = await photoService.getPhoto();
    const arrayPhotos = response.data.hits;
    if (arrayPhotos.length !== 0 ) {
      showTotalHits(response.data.totalHits);
      const markuplist = arrayPhotos.reduce(
        (markup, photo) => markup + createMarkup(photo),
        ''
      );
      updatePhotoGallery(markuplist);
      addStatusLoadMoreBtn();
      galleryLightBox.refresh();
    } else {
      // loadMoreBtn.hide();
      window.removeEventListener('scroll', handleScrollDeb);
      console.log('click event listener was removed from btn');

      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }

  } catch (err) {
    onError(err);
  }
}

function createMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `
  <div class="photo-card">
  <a class="photo-card-link" href="${largeImageURL}">
    <img
      src="${webformatURL}"
      alt="${tags}"
      loading="lazy"
      width=250
      height=200
    />
    </a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <span>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b>
      <span>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <span>${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <span>${downloads}</span>
    </p>
  </div>
  
</div>`;
}

function updatePhotoGallery(markuplist) {
  gallery.insertAdjacentHTML('beforeend', markuplist);
}

function clearPhotoGallery() {
  gallery.innerHTML = '';
}

function onError(err) {
  console.error(err);
  clearPhotoGallery('<p>Not found!</p>');
}

function showTotalHits(totalHits) {
  Notify.info(`Hooray! We found ${totalHits} images.`);
}

function addStatusLoadMoreBtn(length) {
  if (length < 40) {
    return loadMoreBtn.hide();
  } else {
    return loadMoreBtn.enable();
  }
}
// ! Infinite scroll
const handleScrollDeb = debounce(() => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 1) {
    fetchPhotos();
  }
}, DEBOUNCE_DELAY);

window.addEventListener('scroll', handleScrollDeb);
console.log(document);
