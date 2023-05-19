import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const key = `36503211-5a6b1020ee80a2c92835fdd88`;
console.log(gallery);
console.log(form);

const searchParams = new URLSearchParams({
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  page: 1,
  per_page: 40,
});

function getPhoto(value) {
  axios
    .get(`https://pixabay.com/api/?key=${key}&q=${value}&${searchParams}`)
    .then(function (response) {
      const arrayPhotos = response.data.hits;
      if (arrayPhotos.length === 0) {
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      return arrayPhotos.reduce(
        (markup, photo) => markup + createMarkup(photo),
        ''
      );
    })
    .then(updatePhotoGallery)
    .catch(onError);
  // .finally(() => form.reset());
}

form.addEventListener('submit', onSubmit);

function onSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const value = form.elements.searchQuery.value.trim();

  if (value === '') Notify.failure('No value!');
  else {
    clearPhotoGallery();
    getPhoto(value);
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
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="250"
  height="200"/>
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

function updatePhotoGallery(markup) {
  gallery.insertAdjacentHTML('beforeend', markup);
}

function clearPhotoGallery() {
  gallery.innerHTML = '';
}
function onError(err) {
  console.error(err);
  updatePhotoGallery('<p>Not found!</p>');
}
