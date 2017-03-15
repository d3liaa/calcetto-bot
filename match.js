class Match {

  constructor () {
    this.player1 = undefined;
    this.player2 = undefined;
    this.leftChild = undefined;
    this.rightChild = undefined;
  };

  sanitise () {
    if (this.leftChild && this.leftChild.player1 === 0) {
      if (this.player1 === undefined) this.player1 = this.leftChild.player2;
      else this.player2 = this.leftChild.player2;
    } else if (this.rightChild && this.leftChild.player2 === 0) {
      if (this.player1 === undefined) this.player1 = this.leftChild.player1;
      else this.player2 = this.leftChild.player1;
    }
    if (this.leftChild !== undefined) this.leftChild.sanitise();
    if (this.rightChild !== undefined) this.rightChild.sanitise();
  };

  findNextGame () {
    let next;
    function recurseOnMatch (match) {
      if (match.player1 && match.player2) next = match;
      if (!match.player1 && match.leftChild) recurseOnMatch(match.leftChild);
      if (!match.player2 && match.rightChild) recurseOnMatch(match.rightChild);
    }
    recurseOnMatch(this);
    return next;
  };

};

module.exports = Match;
