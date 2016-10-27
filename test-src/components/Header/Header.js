import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

class Header extends Component {
  static propTypes = {
    title: PropTypes.string,
  };

  render() {
    return (
      <header>
        <h1>title}</h1>
      </header>
    );
  }
}

export default Header;