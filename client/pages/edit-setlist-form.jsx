import React from 'react';

export default class EditSetlistForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: [],
      isClickedInputs: {},
      setlistJokes: []
    };
    this.renderJokelist = this.renderJokelist.bind(this);
    this.jokeSelect = this.jokeSelect.bind(this);
    this.addJoke = this.addJoke.bind(this);
    this.buttonRender = this.buttonRender.bind(this);
  }

  componentDidMount() {
    const token = localStorage.getItem('joke-app-jwt');
    fetch('/api/jokeApp', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-access-token': token
      }
    })
      .then(res => {
        if (!res.ok) {
          window.alert('Unexpected Error');
          throw Error('Unexpected Error');
        } else {
          return res.json();
        }
      })
      .then(jokes => {
        const isClickedInputs = {};
        for (let i = 0; i < jokes.length; i++) {
          isClickedInputs[jokes[i].jokeId] = false;
        }
        this.setState({ jokes, isClickedInputs });
      })
      .catch(err => console.error(err.message));
  }

  jokeSelect(event) {
    const setlistJokes = [...this.state.setlistJokes];
    const checklist = this.state.isClickedInputs;
    checklist[event.target.value] = !checklist[event.target.value];
    const setlistIndex = setlistJokes.indexOf(event.target.value);
    if (setlistJokes.length === 0) {
      setlistJokes.push(event.target.value);
    } else if (setlistIndex === -1) {
      setlistJokes.push(event.target.value);
    } else {
      setlistJokes.splice(setlistIndex, 1);
    }
    this.setState({ setlistJokes: setlistJokes, isClickedInputs: checklist });
  }

  addJoke() {
    const jokeId = [];
    const jokesAdded = [];
    const jokeAdd = this.state.isClickedInputs;
    for (const property in jokeAdd) {
      if (jokeAdd[property]) {
        jokeId.push(parseInt(property));
      }
    }
    for (let i = 0; i < this.state.jokes.length; i++) {
      for (let x = 0; x < jokeId.length; x++) {
        if (this.state.jokes[i].jokeId === jokeId[x]) {
          jokesAdded.push(this.state.jokes[i]);
        }
      }
    }
    const setlistId = this.props.setlist.setlistId;
    this.props.onSubmit(jokeId, setlistId, jokesAdded);
    for (const property in jokeAdd) {
      jokeAdd[property] = false;
    }
    this.setState({ isClickedInputs: jokeAdd });
  }

  renderJokelist() {
    const addJokelist = [...this.state.jokes];
    if (this.props.setlist.jokes) {
      const newList = addJokelist.filter(jokes => {
        const foundIndex = this.props.setlist.jokes.findIndex(x => x.jokeId === jokes.jokeId);

        return foundIndex === -1;
      });
      return (
        newList.map(jokes =>
      <div className="list-group-item list-group-item-action mb-1" key={jokes.jokeId} value={jokes.jokeId}>
        <div className="d-flex w-100">
          <div className="d-flex fb-75">
            <input className="form-check-input" checked={this.state.isClickedInputs[jokes.jokeId]} type="checkbox" onChange={this.jokeSelect} name="radioNoLabel" value={jokes.jokeId} aria-label="..."></input>
            <h5 className="ms-1">{jokes.title}</h5>
          </div>
          <div className="d-flex justify-content-between w-60 ms-4">
            <small className="lh-lg"><b>Approx Minutes: </b> {jokes.approxMinutes}</small>
          </div>
        </div>
      </div>
        )
      );
    }
  }

  buttonRender() {
    if (this.props.setlist) {
      if (this.state.jokes.length === 0) {
        return 'visually-hidden';
      }
    }
    return 'btn btn-primary text-center';
  }

  render() {
    if (this.props.setlist.jokes) {
      if (this.props.setlist.jokes.length === this.state.jokes.length) {
        return (
          <h5 className='text-center mt-1'>No Jokes To Add</h5>
        );
      }
    }
    return (
        <div className="list-group mt-1">
          <div className="modal-body">
            {this.renderJokelist()}
          </div>
          <div className="text-center mb-2">
            <button type="button" className={this.buttonRender()} onClick={this.addJoke}>Confirm Jokes</button>
          </div>
        </div >
    );
  }
}
