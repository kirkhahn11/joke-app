import React from 'react';
import EditJokeForm from './edit-joke-form';
import DeleteForm from './delete-form';
import ConfirmSetlistForm from './confirm-setlist-form';

export default class OldJokes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: '',
      editedJoke: [],
      deletedJoke: '',
      targetId: '',
      isClicked: false,
      isClickedEdit: false,
      isClickedSetlist: false,
      isClickedDelete: false,
      setlistJokes: [],
      setlistJokelist: [],
      setlistName: '',
      totalMinutes: 0,
      isClickedInputs: {},
      isClickedSuccess: false,
      isLoaded: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.renderJokeList = this.renderJokeList.bind(this);
    this.deleteJoke = this.deleteJoke.bind(this);
    this.editModal = this.editModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.editJoke = this.editJoke.bind(this);
    this.jokeSelect = this.jokeSelect.bind(this);
    this.setlistModal = this.setlistModal.bind(this);
    this.closeSetlistModal = this.closeSetlistModal.bind(this);
    this.handleChangeName = this.handleChangeName.bind(this);
    this.submitSetlist = this.submitSetlist.bind(this);
    this.confirmClose = this.confirmClose.bind(this);
    this.deleteModal = this.deleteModal.bind(this);
    this.closeDeleteModal = this.closeDeleteModal.bind(this);
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
          window.alert('Could not fetch Joke App data');
          throw Error('Could not fetch Joke App data');
        } else {
          return res.json();
        }
      })
      .then(jokes => {
        const isClickedInputs = {};
        for (let i = 0; i < jokes.length; i++) {
          isClickedInputs[jokes[i].jokeId] = false;
        }
        this.setState({ jokes, isClickedInputs, isLoaded: true });
      })
      .catch(err => console.error(err.message));
  }

  handleClick(event) {
    this.setState({ isClicked: !this.state.isClicked });
  }

  deleteJoke(id) {
    const token = localStorage.getItem('joke-app-jwt');
    const jokeList = [...this.state.jokes];
    const jokeId = {
      jokeId: id
    };
    fetch('/api/jokeApp', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-access-token': token
      },
      body: JSON.stringify(jokeId)
    })
      .then(res => {
        if (!res.ok) {
          window.alert('Unexpected Error');
          throw Error('Unexpected Error');
        } else {
          return res.json();
        }
      })
      .then(data => {
        for (let i = 0; i < jokeList.length; i++) {
          if (jokeList[i].jokeId.toString() === id.toString()) {
            jokeList.splice(i, 1);
            this.setState({ jokes: jokeList, isClickedDelete: !this.state.isClickedDelete });
          }
        }
      })
      .catch(err => console.error(err.message));
  }

  editModal(event) {
    for (let i = 0; i < this.state.jokes.length; i++) {
      if (this.state.jokes[i].jokeId.toString() === event.target.value.toString()) {
        this.setState({ isClickedEdit: !this.state.isClickedEdit, targetId: event.target.value, editedJoke: this.state.jokes[i] });
      }
    }
  }

  deleteModal(event) {
    for (let i = 0; i < this.state.jokes.length; i++) {
      if (this.state.jokes[i].jokeId.toString() === event.target.value.toString()) {
        this.setState({ isClickedDelete: !this.state.isClickedDelete, deletedJoke: this.state.jokes[i] });
      }
    }
  }

  closeDeleteModal() {
    this.setState({ isClickedDelete: false });
  }

  setlistModal() {
    const setlistJokelist = [];
    let totalMinutes = 0;
    for (let i = 0; i < this.state.jokes.length; i++) {
      for (let x = 0; x < this.state.setlistJokes.length; x++) {
        if (this.state.jokes[i].jokeId.toString() === this.state.setlistJokes[x]) {
          setlistJokelist.push(this.state.jokes[i]);
          totalMinutes += parseInt(this.state.jokes[i].approxMinutes);
        }
      }
    }
    this.setState({ isClickedSetlist: !this.state.isClickedSetlist, setlistJokelist, totalMinutes });
  }

  closeModal() {
    this.setState({ isClickedEdit: !this.state.isClickedEdit });
  }

  closeSetlistModal() {
    this.setState({ isClickedSetlist: !this.state.isClickedSetlist });
  }

  editJoke(editedJoke) {
    const jokeList = [...this.state.jokes];
    for (let i = 0; i < jokeList.length; i++) {
      if (jokeList[i].jokeId === editedJoke.jokeId) {
        jokeList.splice(i, 1, editedJoke);
        this.setState({ jokes: jokeList, isClickedEdit: false });
      }
    }
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

  handleChangeName(event) {
    this.setState({ setlistName: event.target.value });
  }

  submitSetlist(event) {
    event.preventDefault();
    const token = localStorage.getItem('joke-app-jwt');
    const jokelist = this.state.isClickedInputs;
    for (const property in jokelist) {
      jokelist[property] = false;
    }
    const jokeIdArray = [];
    for (let i = 0; i < this.state.setlistJokelist.length; i++) {
      jokeIdArray.push(this.state.setlistJokelist[i].jokeId);
    }
    const newSetlist = {
      name: this.state.setlistName,
      jokeId: jokeIdArray,
      totalMinutes: this.state.totalMinutes
    };
    fetch('/api/jokeApp/setlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-access-token': token
      },
      body: JSON.stringify(newSetlist)
    })
      .then(res => {
        if (res.status === 400) {
          window.alert('Setlist Name is a Required Field');
          throw Error('Setlist Name is a Required Field');
        } else if (!res.ok) {
          window.alert('Could not fetch Joke App data');
          throw Error('Could not fetch Joke App data');
        } else {
          return res.json();
        }
      })
      .then(res => this.setState({ setlistName: '', totalMinutes: 0, setlistJokelist: [], setlistJokes: [], isClickedSetlist: false, isClickedInputs: jokelist, isClickedSuccess: true }))
      .catch(err => console.error(err.message));
  }

  confirmClose() {
    this.setState({ isClickedSuccess: false });
  }

  renderJokeList() {
    if (this.state.jokes.length === 0) {
      return (
        <h1>No Jokes Yet! Go to New Jokes page to get started!</h1>
      );
    } else {
      return (
        this.state.jokes.map(jokes =>
          <div className="list-group-item mb-1" key={jokes.jokeId} value={jokes.jokeId}>
            <input className="form-check-input position-absolute" checked={this.state.isClickedInputs[jokes.jokeId]} type="checkbox" onChange={this.jokeSelect} name="radioNoLabel" value={jokes.jokeId} aria-label="..."></input>
            <div className="d-flex flex-column align-items-center">
              <h4 className="ms-1 text-center">{jokes.title}</h4>
              <div className="d-flex justify-content-between w-100">
                <div className="stats fb-31">
                  <small className="lh-lg"><b>Minutes: </b> {jokes.approxMinutes}</small>
                  <small className="lh-lg ml-2"><b>Category: </b>{jokes.name}</small>
                </div>
                <div className="d-flex mt-n1 stats">
                  <button className="btn btn-link" type="button" onClick={this.editModal} value={jokes.jokeId}>Edit</button>
                  <button type="button" className="btn btn-link link-danger" onClick={this.deleteModal} value={jokes.jokeId}>Delete</button>
                </div>
              </div>
            </div>
            <p>{jokes.joke}</p>
          </div>
        )
      );
    }
  }

  render() {
    if (!this.state.isLoaded) {
      return (
        <div className="progress w-75 m-auto mt-5">
          <div className="progress-bar progress-bar-striped progress-bar-animated w-50" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
      );
    } else {
      return (
      <>
        <div className="header">
          <h1>Joke List</h1>
        </div>
        <div className="list-group m-auto mt-1 w-75">
          {this.renderJokeList()}
          <button type="submit" className={`${this.state.setlistJokes.length === 0 ? 'visually-hidden' : 'btn btn-primary w-25 m-auto mt-1'}`} onClick={this.setlistModal}>Create Setlist</button>
        </div>
          <div className={this.state.isClickedEdit ? 'modal-is-active' : 'modal'}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content bg-dark text-white">
                <div className="modal-header ps-10">
                  <h3 className="modal-title"><b>Edit Joke</b></h3>
                  <button type="button" className="btn-close bg-white" data-bs-dismiss="modal" aria-label="Close" onClick={this.closeModal}></button>
                </div>
              <EditJokeForm jokes={this.state.editedJoke} jokeId={this.state.targetId} onSubmit={this.editJoke}/>
            </div>
          </div>
        </div>
        <div className={this.state.isClickedSetlist ? 'modal-is-active' : 'modal'}>
          <div className="modal-dialog modal-m">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header ps-10 pt-0 pb-0">
                <input type="text" className="form-control bg-light text-dark mb-1" id='w-90' placeholder="Setlist Name..." aria-label="Setlist Name..." aria-describedby="basic-addon1" onChange={this.handleChangeName}></input>
                <button type="button" className="btn-close bg-white" data-bs-dismiss="modal" aria-label="Close" onClick={this.closeSetlistModal}></button>
              </div>
              <div className='d-flex border-bottom border-white mt-1'>
                <h6 className='ms-10 flex-basis-60'>Title</h6>
                <h6>Minutes</h6>
              </div>
              <ConfirmSetlistForm setlistJokes={this.state.setlistJokelist} />
              <div className="w-100 border-bottom border-white"></div>
              <div className='text-center mt-1'>
                <h6>Total Minutes: {this.state.totalMinutes}</h6>
              </div>
               <button type="button" className='btn btn-primary btn-large w-50 m-auto mt-1 mb-1' onClick={this.submitSetlist}>Confirm Setlist</button>
            </div>
          </div>
        </div>
        <div className={this.state.isClickedSuccess ? 'modal-is-active' : 'modal'} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Setlist Saved Successfully</h5>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={this.confirmClose} data-bs-dismiss="modal">OK</button>
              </div>
            </div>
          </div>
        </div>
        <div className={this.state.isClickedDelete ? 'modal-is-active' : 'modal'} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <button type="button" className="btn-close bg-white" data-bs-dismiss="modal" aria-label="Close" onClick={this.closeDeleteModal}></button>
              <DeleteForm deletedJoke={this.state.deletedJoke} onSubmit={this.deleteJoke}/>
            </div>
          </div>
        </div>
        <div className={`${this.state.isClickedEdit || this.state.isClickedSetlist || this.state.isClickedDelete ? 'modal-backdrop b-drop' : ''}`}></div>
      </>
      );
    }
  }
}
