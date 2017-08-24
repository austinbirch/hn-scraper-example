// in-memory db for now
const db = {
  scores: []
};

async function updateScores(scores) {
  return (db.scores = scores);
}

async function getScores() {
  return db.scores;
}

// create a database 'connection', even though it's memory only for now.
// this'll let us swap out with a real-db connection later and pass that
// around (easy testing etc)
function makeDBConnection() {
  return {
    db: db,
    updateScores,
    getScores
  };
}

module.exports = {
  makeDBConnection
};
