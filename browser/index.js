import Node from "../browser/Node.js";
import mazeGenerator from "../browser/animations/mazeGenerator.js";
import randomMaze from "../browser/mazeAlgorithms/randomMaze.js";
import verticalSkew from "../browser/mazeAlgorithms/verticalSkewMaze.js";
import horizontalSkew from "../browser/mazeAlgorithms/horizontalSkewMaze.js";
import stairMaze from "../browser/mazeAlgorithms/stairMaze.js";
import unweightedAlgorithms from "../browser/searchAlgorithms/unweightedAlgorithms.js";
import launchAnimations from "../browser/animations/launchAnimations.js";
import weightedAlgorithms from "../browser/searchAlgorithms/weightedAlgorithms.js";
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
  this.shortestPathNodesToAnimate = [];
}

// --------------------FUNCTION FOR INITIALIZING BOARD AREA----------------

Board.prototype.initialize = function () {
  this.contentInitialize();
  this.createGrid();
  this.addEventListeners();
  this.tutorialWork();
  this.restOfListeners();
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
      const currentNodeId = `${row}-${col}`;
      const currentNodeElement = document.getElementById(currentNodeId);
      const currentNode = this.allNodesArray[row][col];

      currentNodeElement.addEventListener(`mousedown`, (e) => {
        e.preventDefault();
        if (this.buttonsActivated) {
          this.mouseDown = true;
          if (
            currentNode.status === `start` ||
            currentNode.status === `target`
          ) {
            this.pressedStatus = currentNode.status;
          } else {
            this.pressedStatus = `normal`;
            this.changeNormalNode(currentNode, currentNodeElement);
          }
        }
      });

      currentNodeElement.addEventListener(`mouseup`, (e) => {
        if (this.buttonsActivated) {
          this.mouseDown = false;
          if (this.pressedStatus === `target`) this.target = currentNodeId;
          else if (this.pressedStatus === `start`) this.start = currentNodeId;
          this.pressedStatus = `normal`;
        }
      });

      currentNodeElement.addEventListener(`mouseenter`, (e) => {
        if (this.buttonsActivated) {
          if (this.mouseDown && this.pressedStatus !== `normal`) {
            this.changeSpecialNode(currentNode, currentNodeElement);
            if (this.pressedStatus === `target`) {
              this.target = currentNodeId;
              if (this.algoComplete) this.redoAlgo();
            } else if (this.pressedStatus === `start`) {
              this.start = currentNodeId;
              if (this.algoComplete) this.redoAlgo();
            }
          } else if (this.mouseDown) {
            this.changeNormalNode(currentNode, currentNodeElement);
          }
        }
      });

      currentNodeElement.addEventListener(`mouseleave`, (e) => {
        if (this.buttonsActivated) {
          if (this.mouseDown && this.pressedStatus !== `normal`) {
            this.changeSpecialNode(currentNode, currentNodeElement);
          }
        }
      });
    }
  }
};

// --------------FUNCTION FOR DEALING WITH START AND TARGET NODES------------

Board.prototype.changeSpecialNode = function (
  currentNode,
  currentNodeElement
) {}; //do

// ---------------FUNCTION FOR REDOING THE ALGORITHM WHEN START AND TARGET ARE MOVED---------------

Board.prototype.redoAlgo = function () {}; //do

// --------------FUNCTION FOR DEALING WITH WALLS AND WEIGHTS------------

Board.prototype.changeNormalNode = function (currNode, currNodeElement) {
  const specialNodes = [`start`, `target`];
  const unweightedalgos = [`breadthfirst`, `depthfirst`];
  if (!this.keyDown) {
    if (!specialNodes.includes(currNode.status)) {
      currNodeElement.className =
        currNode.status !== `wall` ? `wall` : `unvisited`;
      currNode.status =
        currNodeElement.className !== `wall` ? `unvisited` : `wall`;
      currNode.weight = 0;
    }
  } else if (this.keyDown === 87 && !unweightedalgos.includes(this.algo)) {
    if (!specialNodes.includes(currNode.status)) {
      currNodeElement.className =
        currNode.weight !== 15 ? `unvisited weight` : `unvisited`;
      currNode.weight =
        currNodeElement.className !== `unvisited weight` ? 0 : 15;
      currNode.status = `unvisited`;
    }
  }
};

// -------------FUNCTION FOR ACCESSING NODE OF PROVIDED ID---------------

Board.prototype.getNode = function (id) {
  const [i, j] = id.split(`-`);
  return this.allNodesArray[i][j];
};

//-----------------FUNCTION FOR GETTING SHORTEST PATH IN ARRAY -----------------

Board.prototype.addShortestPath = function (type) {
  let currentNode;
  currentNode = this.getNode(this.getNode(this.target).previousNode);
  while (currentNode.id !== this.start) {
    this.shortestPathNodesToAnimate.unshift(currentNode);
    if (type === `draw`) {
      document.getElementById(currentNode.id).className = `shortest-path`;
    }
    currentNode = this.getNode(currentNode.previousNode.id);
  }
};

//draw means class added,  add means not for type

//---------------------FUNCTION FOR DRAWING SHORTEST PATH---------------------

Board.prototype.drawShortestPathTimeout = function (type) {
  let currentNode;
  let secondCurrentNode;
  let currentNodesToAnimate = [];
  currentNode = this.getNode(this.getNode(this.target).previousNode);
  while (currentNode.id !== this.start) {
    currentNodesToAnimate.unshift(currentNode);
    currentNode = this.getNode(currentNode.previousNode.id);
  }

  timeout(0);

  function timeout(currentIndex) {
    if (!currentNodesToAnimate.length)
      currentNodesToAnimate.push(this.getNode(this.start));
    setTimeout(function () {
      if (currentIndex === 0) {
        shortestPathChange(currentNodesToAnimate[currentIndex]);
      } else if (currentIndex < currentNodesToAnimate.length) {
        shortestPathChange(
          currentNodesToAnimate[currentIndex],
          currentNodesToAnimate[currentIndex - 1]
        );
      } else if (currentIndex === currentNodesToAnimate.length) {
        shortestPathChange(
          this.nodes[this.target],
          currentNodesToAnimate[currentIndex - 1],
          `target`
        );
      }
      if (currentIndex > currentNodesToAnimate.length) {
        board.toggleButtons();
        return;
      }
      timeout(currentIndex + 1);
    }, 40);
  }

  function shortestPathChange(currentNode, previousNode, istarget) {
    if (currentNode.id !== this.start) {
      if (
        currentNode.id !== board.target ||
        (currentNode.id === board.target && istarget)
      ) {
        let currentNodeElement = document.getElementById(currentNode.id);
        if (type === `unweighted`) {
          currentNodeElement.className = `shortest-path-unweighted`;
        } else {
          let direction = `direction`;
          if (currentNode[direction] === `up`) {
            currentNodeElement.className = `shortest-path-up`;
          } else if (currentNode[direction] === `down`) {
            currentNodeElement.className = `shortest-path-down`;
          } else if (currentNode[direction] === `right`) {
            currentNodeElement.className = `shortest-path-right`;
          } else if (currentNode[direction] === `left`) {
            currentNodeElement.className = `shortest-path-left`;
          } else {
            currentNodeElement.className = `shortest-path`;
          }
        }
      }
    }
    if (previousNode) {
      if (previousNode.id !== this.target && previousNode.id !== this.start) {
        let previousNodeElement = document.getElementById(previousNode.id);
        previousNodeElement.className =
          previousNode.weight === 15 ? `shortest-path weight` : `shortest-path`;
      }
    } else {
      let element = document.getElementById(this.start);
      element.className = `startTransparent`;
    }
  }
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

// ------------FUNCTION FOR ACTIVATING AND DEACTIVATING CLICKS FOR ALL BUTTONS-------------

Board.prototype.toggleButtons = function () {
  this.buttonsActivated = !this.buttonsActivated;

  const algoOptions = document.querySelectorAll(`.algoOptions`);
  const mazes = document.querySelectorAll(`.maze`);
  const speeds = document.querySelectorAll(`.speeds`);
  const visualizeButton = document.querySelector(`.visualizeButton`);
  const clearLinks = document.querySelectorAll(`.clearLinks`);

  if (this.buttonsActivated === false) {
    algoOptions.forEach((option) => {
      option.classList.add(`activatedLink`);
    });
    mazes.forEach((maze) => {
      maze.classList.add(`activatedLink`);
    });
    clearLinks.forEach((link) => {
      link.classList.add(`activatedLink`);
    });
    speeds.forEach((speed) => {
      speed.classList.add(`activatedLink`);
    });

    visualizeButton.classList.add(`activatedLink`);
  } else {
    algoOptions.forEach((option) => {
      option.classList.remove(`activatedLink`);
    });
    mazes.forEach((maze) => {
      maze.classList.remove(`activatedLink`);
    });
    clearLinks.forEach((link) => {
      link.classList.remove(`activatedLink`);
    });
    speeds.forEach((speed) => {
      speed.classList.remove(`activatedLink`);
    });
    visualizeButton.classList.remove(`activatedLink`);
  }
};

// ------------FUNCTION FOR ATTACHING LISTENERS FOR REST OF THE BUTTONS------------

Board.prototype.restOfListeners = function () {
  //complete this

  const logo = document.querySelector(`.refreshLogo`);
  const dropDowns = document.querySelectorAll(`.dropDown`);
  const visualizeButton = document.querySelector(`.visualizeButton`);
  const algoDescription = document.querySelector(`.algoDescription`);
  const algoOptions = document.querySelectorAll(`.algoOptions`);
  const mazes = document.querySelectorAll(`.maze`);
  const speeds = document.querySelectorAll(`.speeds`);

  logo.addEventListener(`click`, (e) => {
    e.preventDefault();
    location.reload();
  });

  dropDowns.forEach((linkButton) => {
    linkButton.addEventListener(`click`, (e) => {
      // change this
      dropDowns.forEach((dropdown) => {
        if (dropdown !== e.currentTarget) {
          dropdown.classList.remove(`displayDropdown`);
          const a = dropdown.querySelector(`a`);
          a.classList.remove(`activatedLink`);
        }
      });

      e.currentTarget.classList.toggle(`displayDropdown`);
      const link = e.currentTarget.querySelector(`a`);
      link.classList.toggle(`activatedLink`);
    });
  });

  //add connections
  visualizeButton.addEventListener(`click`, (e) => {
    if (this.buttonsActivated) {
      console.log(`algos are changing`);
      if (this.algo.length === 0) {
        e.currentTarget.innerHTML = `Pick an Algorithm!`;
        return;
      }

      if (this.algo === `astar`) {
        this.toggleButtons();
        weightedAlgorithms(this, this.algo);
        launchAnimations(this);
        this.toggleButtons();
      } else if (this.algo === `dijkstra`) {
        weightedAlgorithms(this, this.algo);
        launchAnimations(this);
      } else if (this.algo === `bestfirst`) {
        weightedAlgorithms(this, this.algo);
        launchAnimations(this);
      } else if (this.algo === `breadthfirst`) {
      } else if (this.algo === `depthfirst`) {
      }
    }
  });

  algoOptions.forEach((algo) => {
    algo.addEventListener(`click`, (e) => {
      if (this.buttonsActivated) {
        console.log(`algo content is changing`);

        this.algo = e.currentTarget.id;
        if (this.algo === `astar`) {
          visualizeButton.innerHTML = `Visualize A* !`;
          algoDescription.innerHTML = `A* Search is <strong>weighted</strong> and <strong>guarantees</strong> the shortest path!`;
        } else if (this.algo === `dijkstra`) {
          visualizeButton.innerHTML = `Visualize Dijkstra's !`;
          algoDescription.innerHTML = `Dijkstra's Algorithm is <strong>weighted</strong> and <strong>guarantees</strong> the shortest path!`;
        } else if (this.algo === `bestfirst`) {
          visualizeButton.innerHTML = `Visualize Greedy !`;
          algoDescription.innerHTML = `Greedy Best-first Search is <strong>weighted</strong> and <strong>does not guarantee</strong> the shortest path!`;
        } else if (this.algo === `breadthfirst`) {
          visualizeButton.innerHTML = `Visualize BFS !`;
          algoDescription.innerHTML = `Breadth-first Search is <strong>unweighted</strong> and <strong>guarantees</strong> the shortest path!`;
        } else if (this.algo === `depthfirst`) {
          visualizeButton.innerHTML = `Visualize DFS !`;
          algoDescription.innerHTML = `Depth-first Search is <strong>unweighted</strong> and <strong>does not guarantee</strong> the shortest path!`;
        }
      }
    });
  });

  //add connections
  mazes.forEach((maze) => {
    maze.addEventListener(`click`, (e) => {
      if (this.buttonsActivated) {
        console.log(`maze is generating`);
        const currentMaze = e.currentTarget.id;
        //run clear walls and weights and path function here
        this.toggleButtons();
        if (currentMaze === `verticalskew`) {
          console.log(`verticalskew`);
          verticalSkew(
            this,
            2,
            this.height - 3,
            2,
            this.width - 3,
            "vertical",
            false
          );
          mazeGenerator(this);
        } else if (currentMaze === `horizontalskew`) {
          console.log(`horizontalskew`);
          horizontalSkew(
            this,
            2,
            this.height - 3,
            2,
            this.width - 3,
            "horizontal",
            false
          );
          mazeGenerator(this);
        } else if (currentMaze === `randomwall`) {
          console.log(`randomwall`);
          randomMaze(this, `wall`);
        } else if (currentMaze === `randomweight`) {
          console.log(`randomweight`);
          randomMaze(this, `weight`);
        } else if (currentMaze === `stair`) {
          console.log(`stair`);
          stairMaze(this);
          mazeGenerator(this);
        }
      }
    });
  });

  speeds.forEach((speed) => {
    speed.addEventListener(`click`, (e) => {
      if (this.buttonsActivated) {
        console.log(`speed is changing`);
        this.speed = e.currentTarget.id;
      }
    });
  });
};

//----------------MAKING BOARD OBJECT-------------

let contentHeight = mainContentContainer.offsetHeight;
let docHeight = document.documentElement.scrollHeight;
let docWidth = document.documentElement.scrollWidth;
let height = Math.floor((docHeight - contentHeight - navHeight) / 24);
let width = Math.floor(docWidth / 23);
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

//write launch animations and launch instant animations
//write clearboard , clear walls and weights , clear path
//redo algos
//change special nodes
//stop weights for unweighted algos , write a function for that
//clearboard - should i just do this = new Board
//tasks for css
//rest of animations
export default board.getNode;
