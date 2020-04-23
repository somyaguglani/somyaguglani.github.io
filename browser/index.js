import Node from "../browser/Node.js";
import mazeGenerator from "../browser/animations/mazeGenerator.js";
import randomMaze from "../browser/mazeAlgorithms/randomMaze.js";
const gridContainer = document.querySelector(`.grid`);
const navbarContainer = document.querySelector(`.navbarContainer`);
let navHeight = navbarContainer.offsetHeight;
const mainContentContainer = document.querySelector(`.mainContentContainer`);

//---------------FUNCTIONS---------------

// ------------CONSTRUCTOR FOR BOARD OBJECT-----------------

function Board(width, height) {
  this.width = width;
  this.height = height;
  this.wallsAnimationArray = [];
  this.algoComplete = false;
  this.speed = `fast`;
  this.algo = ``;
  this.start = ``;
  this.target = ``;
  this.allNodesArray = [];
  this.nodesToAnimate = [];
  this.tutorialContentArray = [];
  this.pressedStatus = `normal`;
  this.mouseDown = false;
  this.keyDown = false;
  this.buttonsActivated = false;
}

// --------------------FUNCTION FOR INITIALIZING BOARD AREA----------------

Board.prototype.initialize = function () {
  this.contentInitialize();
  this.createGrid();
  this.addEventListeners();
  this.tutorialWork();
};

// -----------FUNCTION FOR CREATING GRID----------------

Board.prototype.createGrid = function () {
  let htmlOfGrid = ``;
  for (let row = 0; row < this.height; row++) {
    let gridRow = `<tr id = "row_${row}">`;
    const allNodesRowArray = [];
    for (let col = 0; col < this.width; col++) {
      const id = `${row}-${col}`;
      let nodeStatus;
      if (
        row === Math.floor(this.height / 2) &&
        col === Math.floor(this.width / 4) &&
        this.start.length === 0
      ) {
        nodeStatus = `start`;
        this.start = `${id}`;
      } else if (
        row === Math.floor(this.height / 2) &&
        col === Math.floor((3 * this.width) / 4) &&
        this.target.length === 0
      ) {
        nodeStatus = `target`;
        this.target = `${id}`;
      } else {
        nodeStatus = `unvisited`;
      }
      const newNode = new Node(id, nodeStatus);
      allNodesRowArray.push(newNode);
      gridRow += `<td id="${id}" class="${nodeStatus}"></td>`;
    }
    htmlOfGrid += `${gridRow}</tr>`;
    this.allNodesArray.push(allNodesRowArray);
  }
  gridContainer.innerHTML = htmlOfGrid;
};

// -----------------------FUNCTION FOR ADDING LISTENERS TO GRID --------------

Board.prototype.addEventListeners = function () {
  for (let row = 0; row < this.height; row++) {
    for (let col = 0; col < this.width; col++) {
      //start work
      const currNodeId = `${row}-${col}`;
      const currNodeElement = document.getElementById(`${currNodeId}`);
      const currNode = this.getNode(currNodeId);

      //work for mousedown
      currNodeElement.addEventListener(`mousedown`, (e) => {
        e.preventDefault();
        if (1) {
          //this.buttonsOn
          this.mouseDown = true;
          if (currNode.status === `start` || currNode.status === `target`) {
            this.pressedStatus = currNode.status;
          } else {
            this.pressedStatus = `normal`;
            this.changeNormalNode(currNode, currNodeElement);
          }
        }
      });
      //work for mouseup

      currNodeElement.addEventListener(`mouseup`, (e) => {
        if (1) {
          //this.buttonsOn
          this.mouseDown = false;
          if (this.pressedStatus === `start`) this.start = currNodeId;
          else if (this.pressedStatus === `target`) this.target = currNodeId;
          // this.pressedStatus= `normal`;  is this imp not yet decided
        }
      });

      //work for mouse enter
      currNodeElement.addEventListener(`mouseenter`, (e) => {
        if (1) {
          //this.buttonsOn
          if (this.mouseDown && this.pressedStatus !== `normal`) {
            this.changeSpecialNode(currNode, currNodeElement);
            if (currNode.status === `start`) {
              this.start = currNodeId;
              if (this.algoComplete) this.redoAlgo();
            } else if (currNode.status === `target`) {
              this.target = currNodeId;
              if (this.algoComplete) this.redoAlgo();
            }
          } else if (this.mouseDown) {
            this.changeNormalNode(currNode, currNodeElement);
          }
        }
      });

      //work for mouse leave
      currNodeElement.addEventListener(`mouseleave`, () => {
        if (1) {
          //this.buttinsOn
          if (this.mouseDown && this.pressedStatus !== `normal`) {
            this.changeSpecialNode(currNode, currNodeElement);
          }
        }
      });
      //end work
    }
  }
};

// --------------FUNCTION FOR DEALING WITH START AND TARGET NODES------------

Board.prototype.changeSpecialNode = function (currNode, currNodeElement) {}; //do

// ---------------FUNCTION FOR REDOING THE ALGORITHM WHEN START AND TARGET ARE MOVED---------------

Board.prototype.redoAlgo = function () {}; //do

// --------------FUNCTION FOR DEALING WITH WALLS AND WEIGHTS------------

Board.prototype.changeNormalNode = function (currNode, currNodeElement) {
  const unweightedAlgos = [`bfs`, `dfs`];
  if (!this.keyDown) {
    currNodeElement.className =
      currNode.status === `unvisited` ? `wall` : `unvisited`;
    currNode.status = currNodeElement.className;
  } else if (this.keyDown === 87 && !unweightedAlgos.includes(this.algo)) {
    console.log(`weights`);
    currNodeElement.className =
      currNode.weight !== 15 ? `unvisited weight` : `unvisited`;
    currNode.weight = currNodeElement.className === `unvisited weight` ? 15 : 0;
    currNode.status = `unvisited`;
  }
};

// -------------FUNCTION FOR ACCESSING NODE OF PROVIDED ID---------------

Board.prototype.getNode = function (id) {
  const [i, j] = id.split(`-`);
  return this.allNodesArray[i][j];
};

// ---------------FUNCTION FOR PROVIDING TEXT FOR TUTORIAL-------------

let counter = 0;

Board.prototype.contentInitialize = function () {
  this.tutorialContentArray.push(
    `<h1>Welcome to Pathfinding Visualizer!</h1>
        <h2>
          This short tutorial will walk you through all of the features of this
          application.
        </h2>
        <p>
          If you want to dive right in, feel free to press the "Skip Tutorial"
          button below. Otherwise, press "Next"!
        </p>
        <div class="pageCounter">1/7</div>
        <p>If you want to see the source code for this application, check out my <a  href="https://github.com/somyaguglani/Pathfinding-Visualizer" >github </a></p>
        <img style=" height:150px;" src="./styling/imagesAndSvg/c_icon.png" alt="startingIcon">

        <div class ="tutorialButtons">
          <button class="skipButton">Skip Tutorial</button>
          <button class="prevButton">Previous</button>
          <button class="nextButton">Next</button>
        </div>`
  );
  this.tutorialContentArray.push(`<h1>What is a pathfinding algorithm?</h1>
        <h2>
        At its core, a pathfinding algorithm seeks to find the shortest path between two points. This application visualizes various pathfinding algorithms in action, and more!
        </h2>
        <p>
        All of the algorithms on this application are adapted for a 2D grid, where 90 degree turns have a "cost" of 1 and movements from a node to another have a "cost" of 1.
        </p>
        <div class="pageCounter">2/7</div>
        <img src="./styling/imagesAndSvg/path.png" alt="path">
        <div class="tutorialButtons">
          <button class="skipButton">Skip Tutorial</button>
          <button class="prevButton">Previous</button>
          <button class="nextButton">Next</button>
        </div>`);
  this.tutorialContentArray.push(`<h1>Picking an algorithm</h1>
        <h2>
        Choose an algorithm from the "Algorithms" drop-down menu.
        </h2>
        <p>
       Note that some algorithms are <strong>unweighted</strong>, while others are <strong>weighted</strong>. Unweighted algorithms do not take turns or weight nodes into account, whereas weighted ones do. Additionally, not all algorithms guarantee the shortest path.
        </p>
        <div class="pageCounter">3/7</div>
        <img src="./styling/imagesAndSvg/algorithms.png" alt="algoDemo">
        <div class="tutorialButtons">
          <button class="skipButton">Skip Tutorial</button>
          <button class="prevButton">Previous</button>
          <button class="nextButton">Next</button>
        </div>`);
  this.tutorialContentArray.push(`<h1>Meet the algorithms</h1>
        <h2>
       Not all algorithms are created equal.
        </h2>
        <p>
     <strong> Dijkstra's Algorithm</strong> (weighted): the father of pathfinding algorithms; guarantees the shortest path
     </br>
 <strong>A* Search  </strong>(weighted): arguably the best pathfinding algorithm; uses heuristics to guarantee the shortest path much faster than Dijkstra's Algorithm
 </br>
 <strong>Greedy Best-first Search  </strong>(weighted): a faster, more heuristic-heavy version of A*; does not guarantee the shortest path
 </br>
 <strong>Swarm Algorithm  </strong>(weighted): a mixture of Dijkstra's Algorithm and A*; does not guarantee the shortest-path
 </br>
 <strong>Convergent Swarm Algorithm </strong>(weighted) : the faster, more heuristic-heavy version of Swarm; does not guarantee the shortest path
 </br>
 <strong>Bidirectional Swarm Algorithm </strong> (weighted): Swarm from both sides; does not guarantee the shortest path
 </br>
 <strong>Breath-first Search </strong> (unweighted): a great algorithm; guarantees the shortest path
 </br>
 <strong>Depth-first Search </strong> (unweighted): a very bad algorithm for pathfinding; does not guarantee the shortest path
        </p>
        <div class="pageCounter">4/7</div>
        <div class="tutorialButtons">
          <button class="skipButton">Skip Tutorial</button>
          <button class="prevButton">Previous</button>
          <button class="nextButton">Next</button>
        </div>`);
  this.tutorialContentArray.push(`<h1>Adding walls and weights</h1>
        <h3>
       Click on the grid to add a wall. Click on W to add weights and again to stop. Generate mazes and patterns from the "Mazes & Patterns" drop-down menu.
        </h3>
        <p>
       Walls are impenetrable, meaning that a path cannot cross through them. Weights, however, are not impassable. They are simply more "costly" to move through. In this application, moving through a weight node has a "cost" of 15.
        </p>
        <div class="pageCounter">5/7</div>
        <img src="./styling/imagesAndSvg/walls.gif" alt="wallsDemo">
        <div class="tutorialButtons">
          <button class="skipButton">Skip Tutorial</button>
          <button class="prevButton">Previous</button>
          <button class="nextButton">Next</button>
        </div>`);
  this.tutorialContentArray.push(`<h1>Dragging nodes</h1>
        <h2>
    Click and drag the start, bomb, and target nodes to move them.
        </h2>
        <p>
      Note that you can drag nodes even after an algorithm has finished running. This will allow you to instantly see different paths.
        </p>
        <div class="pageCounter">6/7</div>
        <img src="./styling/imagesAndSvg/dragging.gif" alt="draggingDemo">
        <div class="tutorialButtons">
          <button class="skipButton">Skip Tutorial</button>
          <button class="prevButton">Previous</button>
          <button class="nextButton">Next</button>
        </div>`);
  this.tutorialContentArray.push(`<h1>Visualizing and more</h1>
        <h2>
       Use the navbar buttons to visualize algorithms and to do other stuff!
        </h2>
        <p>
      You can clear the current path, clear walls and weights, clear the entire board, and adjust the visualization speed, all from the navbar. If you want to access this tutorial again, click on "Pathfinding Visualizer" in the top left corner of your screen.
        </p>
        <div class="pageCounter">7/7</div>
        <img class = "responsive-img" src="./styling/imagesAndSvg/navbar.png" alt="algoDemo">
        <h2>Now it's time to play around with the visualizer. I hope you have as much fun as i had building it. Enjoy!</h2>
        <div class="tutorialButtons">
          <button class="skipButton">Skip Tutorial</button>
          <button class="prevButton">Previous</button>
          <button class="nextButton">Finish</button>
        </div>`);
};

// ------------------FUNCTION FOR BUTTONS AND DYNAMIC CONTENT OF TUTORIAL MODAL--------------

Board.prototype.tutorialWork = function () {
  const board = this;
  const modal = document.querySelector(`.tuturialContainerModal`);
  const modalInner = document.querySelector(`.modalInner`);
  const tutorialButtonsFlex = document.querySelectorAll(`.tutorialButtons`);
  const tutorialButtons = tutorialButtonsFlex[0].querySelectorAll(`button`);
  tutorialButtons.forEach((button) => {
    button.addEventListener(`click`, function (e) {
      if (e.currentTarget.classList.value === `skipButton`) {
        modal.style.display = `none`;
        board.toggleButtons();
      } else if (e.currentTarget.classList.value === `prevButton`) {
        if (counter > 0) {
          counter--;
          modalInner.innerHTML = board.tutorialContentArray[counter];
          board.tutorialWork();
        }
      } else if (e.currentTarget.classList.value === `nextButton`) {
        if (counter === board.tutorialContentArray.length - 1) {
          modal.style.display = `none`;
          board.toggleButtons();
          return;
        }
        if (counter < board.tutorialContentArray.length) {
          counter++;
          modalInner.innerHTML = board.tutorialContentArray[counter];
          board.tutorialWork();
        }
      }
    });
  });
};

// ------------FUNCTION FOR ACTIVATING AND DEACTIVATING CLICKS FOR ALL BUTTONS------------

Board.prototype.toggleButtons = function () {
  //complete this
  this.buttonsActivated = !this.buttonsActivated;
  const logo = document.querySelector(`.refreshLogo`);
  logo.addEventListener(`click`, (e) => {
    e.preventDefault();
    location.reload();
  });

  const dropDowns = document.querySelectorAll(`.dropDown`);
  dropDowns.forEach((linkButton) => {
    linkButton.addEventListener(`click`, (e) => {
      linkButton.classList.toggle(`displayDropdown`);
    });
  });

  const algoOptions = document.querySelectorAll(`.algoOptions`);
};

//----------------MAKING BOARD OBJECT-------------

let contentHeight = mainContentContainer.offsetHeight;
let docHeight = document.documentElement.scrollHeight;
let docWidth = document.documentElement.scrollWidth;
let height = Math.floor((docHeight - contentHeight - navHeight) / 28);
let width = Math.floor(docWidth / 26);
let board = new Board(width, height);
board.initialize();

// ------------EVENT LISTENERS-------------------

window.addEventListener(`keydown`, (e) => {
  if (board.keyDown) {
    board.keyDown = false;
  } else {
    board.keyDown = e.keyCode;
  }
});
//tasks for js
//change special nodes
//redo algos
//stop weights for unweighted algos
//stop changing visited nodes to blank (they either become wall or weight)
//function for checking for weights before doing unweighted algos
//clear board
//clear paths
//draw shorest path
//toggle buttons

//tasks for css
//change color of dropdowns on click
//rest of animations
//how to make dropdown close is mouse up good?
