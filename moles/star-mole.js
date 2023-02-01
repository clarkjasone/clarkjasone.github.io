const MIN_INTERVAL = 2000;
const MAX_INTERVAL = 18000;
const FED_INTERVAL = 500;
const HUNGRY_INTERVAL = 2000;
const background = document.querySelector('.bg');
const winImage = document.querySelector('.win');
const wormBar = document.querySelector('.worm-container');
const moleHole = [];
const winningScore = 10;
let score = 0;

// define interval calc functions
const calcInterval = () => Date.now() + Math.floor(Math.random() * MAX_INTERVAL) + MIN_INTERVAL;
const calcHungryInterval = () => Date.now() + HUNGRY_INTERVAL;
const calcFedInterval = () => Date.now() + FED_INTERVAL;
const calcKingStatus = () => Math.random() >= 0.9;

function init() {
  // initialize moleHole statuses
  const moleObj = {
    status: 'empty', // empty, hungry, fed, sad, leaving
    king: '', // '' or 'king-'
    updateAt: 0 // time until next image change
  }

  for (let i = 0; i < 10; i++) {
    // initialize statuses for each mole hole as empty - deep copy of moleObj
    moleHole[i] = JSON.parse(JSON.stringify(moleObj));
    // initialize a random initial image update time for each mole hole
    // this will be somewhere between 2 and 20 seconds from now
    moleHole[i].updateAt = calcInterval();
    
    // create containers for each mole hole and initialize them as empty
    const container = document.createElement('div');
    const div = document.createElement('div');
    const img = document.createElement('img');
    container.className = 'hole-container';
    div.className = 'hole';
    div.id = `hole-${i}`;
    img.className = 'mole';
    img.classList.add('hide');
    img.alt = 'mole';
    img.setAttribute('data-index', i);
    img.src = '';
    img.addEventListener('click', incrementScore);
    div.appendChild(img);
    container.appendChild(div);
    background.appendChild(container);
  }
}

function updateMoleHoles() {
  // evaluate the status of each mole hole and update as needed
  for (let i = 0; i < moleHole.length; i++) {
    if (Date.now() > moleHole[i].updateAt) {
      const img = document.getElementById(`hole-${i}`).firstChild;
      switch(moleHole[i].status) {
        case 'empty':
          // if the status is currently empty, change to hungry; also as a king 10% of the time
          moleHole[i].status = 'hungry';
          moleHole[i].king = calcKingStatus() ?  'king-' : '';
          img.src = `./images/${moleHole[i].king}mole-hungry.png`;
          img.classList.add('hungry');
          img.classList.remove('hide');
          // set next update time for 2 seconds from now
          moleHole[i].updateAt = calcHungryInterval();
          break;
        case 'hungry':
          // if the status is currently hungry, change to sad
          moleHole[i].status = 'sad';  
          img.src = `./images/${moleHole[i].king}mole-sad.png`;
          img.classList.remove('hungry');
          // set next update time for half a second from now
          moleHole[i].updateAt = calcFedInterval();
          break;
        case 'fed': 
        case 'sad':
          // if the status is currently fed or sad, change to leaving
          moleHole[i].status = 'leaving';  
          img.src = `./images/${moleHole[i].king}mole-leaving.png`;
          // set next update time for half a second from now
          moleHole[i].updateAt = calcFedInterval();
          break;
        case 'leaving': // this is more explicit than using
          // otherwise, change to empty and hide the image
          moleHole[i].status = 'empty';  
          moleHole[i].king = '';
          img.src = '';
          img.classList.add('hide');
          // set the next update time for somewhere between 2 and 20 seconds from now
          moleHole[i].updateAt = calcInterval();
      }
    }
  }
  requestAnimationFrame(updateMoleHoles);
}

function incrementScore(event) {
  const img = event.target;
  const classes = Object.values(img.classList);
  const index = img.dataset.index; // NOTE: dataset.index is a string so index becomes a string - this is coerced into a number when used within an array
  if (classes.includes('hungry')) {
    // if the clicked hole contains a hungry mole, increase the score appropriately
    if (moleHole[index].king) {
      // if the hungry mole is a king, add two to the score
      score += 2;
    } else {
      // otherwise add one
      score++;
    }

    // update the mole status and image to fed, remove the hungry class, and calc a new update time
    moleHole[index].status = 'fed';  
    img.src = `./images/${moleHole[index].king}mole-fed.png`;
    img.classList.remove('hungry');
    moleHole[index].updateAt = calcFedInterval();

    // update the worm bar indicating the score
    wormBar.style.width = `${(score / winningScore) * 100}%`;
  
    if (score >= winningScore) {
      // the player has won - show the winning image
      background.classList.add('hide');
      winImage.classList.add('show');
    }
  }
}

init();
requestAnimationFrame(updateMoleHoles);