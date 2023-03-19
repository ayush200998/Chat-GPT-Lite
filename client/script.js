import './style.css';
import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

/**
 * To show loader (...) when the user is typing something.
 * @param {*} element 
 */
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    if (element.textContent === '....' || element.textContent.length > 3) {
      element.textContent = '';
    } else {
      element.textContent += '.'
    }
  }, 300);

};

/**
 * * Types the data returned from API call in a sequential manner.
 * @param {*} element 
 * @param {*} text 
 */
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
};

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexaDecimalString}`;
}

/**
 * * Returns a single container for a query and AI's response
 * @param {*} isAi 
 * @param {*} value 
 * @param {*} uniqueId 
 * @returns 
 */
function chatStripe(isAi, value, uniqueId) {
  console.log('Inside func', {
    isAi,
    value,
    uniqueId,
  })
  return (
    `
      <div class='wrapper ${isAi && 'ai'}'> 
        <div class='chat'>
          <div class='profile'>
            <img
              src='${isAi ? bot : user}'
              alt='${isAi ? 'bot' : 'user'}'
            />
          </div>

          <div class='message' id='${uniqueId}'> ${value} </div>
        </div>
      </div>
    `
  )
}

/**
 * * When user clicks on send button 
 * @param {*} e 
 */
const handleSubmit = async(e) => {
  e.preventDefault();

  const data = new FormData(form);
  // User's container
  chatContainer.innerHTML += chatStripe(false, data.get('query'), 'user-query');

  form.reset();

  const uniqueId = generateUniqueId();

  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // Send the api request to BE server
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: data.get('query'),
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const error = await response.text();

    messageDiv.innerHTML = 'Something went wrong';
    alert(error);
  }
}


document.addEventListener('submit', handleSubmit);
document.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
});