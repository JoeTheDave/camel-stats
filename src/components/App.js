import React, { Component } from 'react';
import '../css/app.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState();

    this.onCamelClick = this.onCamelClick.bind(this);
    this.onStartNewRaceButtonClick = this.onStartNewRaceButtonClick.bind(this);
    this.onAdvanceButtonClick = this.onAdvanceButtonClick.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
  }

  // Utility Functions

  getInitialState() {
    const board = [];
    for (let i = 0; i < 16; i++) {
      board.push({
        index: i,
        modifier: 0,
      });
    }
    const camels = [
      { name: 'white', position: 15, stack: 0 },
      { name: 'orange', position: 15, stack: 1 },
      { name: 'yellow', position: 15, stack: 2 },
      { name: 'green', position: 15, stack: 3 },
      { name: 'blue', position: 15, stack: 4 },
    ];
    const dice = {
      white: null,
      orange: null,
      yellow: null,
      green: null,
      blue: null,
    };
    return {
      board,
      camels,
      dice,
    }
  }

  getCamelsAtPosition(state, position) {
    return state.camels.filter(camel => {
      return camel.position === position;
    });
  }

  reformatCamelStackAtPosition(state, position) {
    const camelsAtPosition = this.getCamelsAtPosition(state, position);
    camelsAtPosition.sort((a, b) => {
      return a.stack - b.stack;
    }).forEach((camel, index) => {
      camel.stack = index;
    });
  }

  getAvailableDice(state) {
    return Object.keys(state.dice).filter(key => !state.dice[key]);
  }

  advanceStateByDieRoll(state, camelName, dieRoll) {
    const movingCamel = state.camels.find(camel => camel.name === camelName);
    const oldPosition = movingCamel.position;
    const oldStackPosition = movingCamel.stack;
    let newPosition = oldPosition + dieRoll;
    if (newPosition >= 16) { newPosition = newPosition - 16; }
    state.dice[camelName] = dieRoll;
    const newPositionModifier = state.board[newPosition].modifier;
    newPosition += newPositionModifier;

    state.camels
      .filter(camel => camel.position === oldPosition && camel.stack >= oldStackPosition)
      .sort((a, b) => {
        return a.stack - b.stack;
      }).forEach(camel => {
        if (newPositionModifier === -1) {
          camel.stack = camel.stack - 10;
        } else {
          camel.stack = camel.stack + 10;
        }
        camel.position = newPosition;
      });
    this.reformatCamelStackAtPosition(state, newPosition);
    this.reformatCamelStackAtPosition(state, oldPosition);
  }

  resetStateForNewLeg(state) {
    state.dice = {
      white: null,
      orange: null,
      yellow: null,
      green: null,
      blue: null,
    };
    state.board.forEach(cell => cell.modifier = 0);
  }

  // Events

  onCamelClick(e) {
    const camelName = e.target.id.split('-')[1];
    const state = this.state;
    const camel = state.camels.find(camel => camel.name === camelName);
    const oldPosition = camel.position;
    let newPosition = oldPosition + 1;
    if (newPosition === 16) { newPosition = 0; }
    const newStackPosition = this.getCamelsAtPosition(state, newPosition).length;
    camel.position = newPosition;
    camel.stack = newStackPosition;
    this.reformatCamelStackAtPosition(state, oldPosition);
    this.setState(state);
  }

  onStartNewRaceButtonClick() {
    const state = this.getInitialState();
    state.camels.forEach(camel => {
      const startPosition = Math.floor(Math.random() * 3);
      const stackPosition = this.getCamelsAtPosition(state, startPosition).length;
      camel.position = startPosition;
      camel.stack = stackPosition;
    })
    this.setState(state);
  }

  onAdvanceButtonClick() {
    const state = this.state;
    const availableDice = this.getAvailableDice(state);
    if (availableDice.length > 0) {
      const randomDie = availableDice[(Math.floor(Math.random() * availableDice.length) + 1) - 1];
      const dieRoll = Math.floor(Math.random() * 3 + 1);
      this.advanceStateByDieRoll(state, randomDie, dieRoll);
    } else {
      this.resetStateForNewLeg(state);
    }
    this.setState(state);
  }

  onCellClick(e) {
    const state = this.state;
    const cellIndex = parseInt(e.target.className.split('-')[1], 10);
    let nextNeighbor = cellIndex + 1;
    if (nextNeighbor === 16) { nextNeighbor = 0; }
    let prevNeighbor = cellIndex - 1;
    if (prevNeighbor === -1) { prevNeighbor = 15; }
    const openNeighbors = state.board[nextNeighbor].modifier === 0 && state.board[prevNeighbor].modifier === 0;
    if (cellIndex !== 0 && openNeighbors) {
      if (state.board[cellIndex].modifier === 0) {
        state.board[cellIndex].modifier = 1;
      }
      else if (state.board[cellIndex].modifier === 1) {
        state.board[cellIndex].modifier = -1;
      }
      else if (state.board[cellIndex].modifier === -1) {
        state.board[cellIndex].modifier = 0;
      }
    }
    this.setState(state);
  }

  render() {
    return (
      <div className="App">
        <div className="board">
          {this.state.board.map((cell, index) => {
            const cellModifierClass = cell.modifier === 0 ? '' : (cell.modifier === 1 ? ' cell-forward': ' cell-back')
            return (
              <div
                key={`cell-${cell.index}`}
                className={`cell cell-${cell.index}${cellModifierClass}`}
                onClick={this.onCellClick}>
              </div>
            );
          })}
          {this.state.camels.map((camel) => {
            return (
              <div 
                key={`camel-${camel.name}`}
                id={`camel-${camel.name}`}
                className={`camel camel-${camel.name} camel-position-${camel.position}-${camel.stack}`} 
                onClick={this.onCamelClick}>
              </div>
            );
          })}
          <div className="controls">
            <button type="button" onClick={this.onStartNewRaceButtonClick}>Start New Race</button>
            <button type="button" onClick={this.onAdvanceButtonClick}>Advance</button>
            <div className="dice-container">
              {Object.keys(this.state.dice).map((dice) => {
                return (
                  <div key={`dice-${dice}`} className={`dice dice-${dice}`}>{this.state.dice[dice]}</div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
