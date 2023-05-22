import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

const key = `36503211-5a6b1020ee80a2c92835fdd88`;

const searchParams = new URLSearchParams({
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 40,
});
let lightbox;

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

    // const arrayPhotos = response.data.hits;
    // showTotalHits(response.data.totalHits);
    // return arrayPhotos;
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
loadMoreBtn.button.addEventListener('click', fetchPhotos);

function onSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const value = form.elements.searchQuery.value.trim();

  if (value === '') Notify.failure('No value!');
  else {
    photoService.searchValue = value;
    photoService.resetPage();
    clearPhotoGallery();
    getPhotoMarkup();
    form.reset();
    loadMoreBtn.show();
    initializeLightbox();
  }
}

async function getPhotoMarkup() {
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
    loadMoreBtn.enable();
    return updatePhotoGallery(markuplist);
  }
}

async function fetchPhotos() {
  try {
    loadMoreBtn.disable();
    const response = await photoService.getPhoto();
    const arrayPhotos = response.data.hits;
    if (arrayPhotos.length === 0) {
      loadMoreBtn.hide();
      Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return '';
    } else {
      showTotalHits(response.data.totalHits);
      const markuplist = arrayPhotos.reduce(
        (markup, photo) => markup + createMarkup(photo),
        ''
      );
      loadMoreBtn.enable();
      return updatePhotoGallery(markuplist);
    }
    initializeLightbox();
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
  </a>
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
// ! Infinite scroll
function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 5) {
    fetchPhotos();
  }
}

window.addEventListener('scroll', handleScroll);

function initializeLightbox() {
  const lightbox = new SimpleLightbox('.photo-card .photo-card-link', {
    captions: true,
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
  });
}

// const lightbox = new SimpleLightbox('.gallery a', {
//   captionsData: 'alt',
//   captionDelay: 250,
//   animationSpeed: 250,
// });

// let galleryLightBox = new SimpleLightbox('.gallery a', {
//   captions: true,
//   captionsData: 'alt',
//   captionPosition: 'bottom',
//   captionDelay: 250,
// });
// console.log(galleryLightBox);

// lightbox.on('show.simplelightbox', function () {
//   console.log('heloo');
// });
// lightbox.refresh();

// let gallery = new SimpleLightbox(".gallery a", {
//   captionDelay: 250,
//   captionsData: "alt",
// });
// let lightbox = new SimpleLightbox(
//  ('.gallery a') ,
//   {
//     captions: true,
//     captionsData: 'alt',
//     captionPosition: 'bottom',
//     captionDelay: 250,
//   }
// );
// console.log(lightbox);

// lightbox.on('shown.simplelightbox', function () {});

// // lightbox.refresh();
