const canvas = document.getElementById('tetris');
    const context = canvas.getContext('2d');
    context.scale(30, 30);

    const ROWS = 20;
    const COLS = 10;

    let arena = createMatrix(COLS, ROWS);
    let player = {
      pos: {x: 0, y: 0},
      matrix: null,
      score: 0
    };

    const colors = [
      null,
      '#FF0D72',
      '#0DC2FF',
      '#0DFF72',
      '#F538FF',
      '#FF8E0D',
      '#FFE138',
      '#3877FF'
    ];

    const pieces = 'ILJOTSZ';

    function createMatrix(width, height) {
      const matrix = [];
      while (height--) {
        matrix.push(new Array(width).fill(0));
      }
      return matrix;
    }

    function createPiece(type) {
      switch (type) {
        case 'T':
          return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
          ];
        case 'O':
          return [
            [2, 2],
            [2, 2]
          ];
        case 'L':
          return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
          ];
        case 'J':
          return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
          ];
        case 'I':
          return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0]
          ];
        case 'S':
          return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
          ];
        case 'Z':
          return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
          ];
      }
    }

    function collide(arena, player) {
      const [m, o] = [player.matrix, player.pos];
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
          if (m[y][x] !== 0 &&
              (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
            return true;
          }
        }
      }
      return false;
    }

    function merge(arena, player) {
      player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            arena[y + player.pos.y][x + player.pos.x] = value;
          }
        });
      });
    }

    function rotate(matrix, dir) {
      for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
      }
      if (dir > 0) {
        matrix.forEach(row => row.reverse());
      } else {
        matrix.reverse();
      }
    }

    function playerDrop() {
      player.pos.y++;
      if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
      }
      dropCounter = 0;
    }

    function playerMove(offset) {
      player.pos.x += offset;
      if (collide(arena, player)) {
        player.pos.x -= offset;
      }
    }

    function playerReset() {
      player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
      player.pos.y = 0;
      player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
      if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
      }
    }

    function arenaSweep() {
      outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
          if (arena[y][x] === 0) {
            continue outer;
          }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++player.score;
      }
    }

    function drawMatrix(matrix, offset) {
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            context.fillStyle = colors[value];
            context.fillRect(x + offset.x, y + offset.y, 1, 1);
          }
        });
      });
    }

    function draw() {
      context.fillStyle = '#000';
      context.fillRect(0, 0, canvas.width, canvas.height);

      drawMatrix(arena, {x: 0, y: 0});
      drawMatrix(player.matrix, player.pos);
    }

    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;

    function update(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;

      dropCounter += deltaTime;
      if (dropCounter > dropInterval) {
        playerDrop();
      }

      draw();
      requestAnimationFrame(update);
    }

    function updateScore() {
      document.getElementById('score').innerText = `Score: ${player.score}`;
    }

    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        playerMove(-1);
      } else if (event.key === 'ArrowRight') {
        playerMove(1);
      } else if (event.key === 'ArrowDown') {
        playerDrop();
      } else if (event.key === 'ArrowUp') {
        rotate(player.matrix, 1);
        if (collide(arena, player)) {
          rotate(player.matrix, -1);
        }
      }
    });

    document.getElementById('start').addEventListener('click', () => {
      playerReset();
      updateScore();
      update();
    });