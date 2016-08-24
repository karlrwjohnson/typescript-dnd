import * as dom from './dom';
import * as fn from './fn';
import * as misc from './misc';

type Coordinate = [number, number];

interface TileType {}

class Tile {
  constructor (coodrinates: Coordinate, map: Map) {
    this.map = map;
    this.coordinates = coodrinates;
  }

  type: TileType;
  map: Map;
  coordinates: Coordinate;
}

class Map {
  _width: number;
  _height: number;
  _tiles: Tile[][];

  constructor (width, height, tileSupplier?: (coordinate: Coordinate, map: Map) => Tile) {
    this._width = width;
    this._height = height;

    if (!tileSupplier) {
      tileSupplier = (coordinate, map) => new Tile(coordinate, map);
    }

    this._tiles = fn.arange(height, y =>
        fn.arange(width, x=>
            tileSupplier([x, y], this)
        )
    );
  }

  get width() { return this._width; }
  get height() { return this._height; }
  getTile(x: number, y: number) {
    if (x >= 0 && y >= 0 && x < this._width && y < this._height) {
      return this._tiles[y][x];
    } else {
      throw new Error(`Coordinate ${x},${y} is ouside map boundaries ${this._width}x${this._height}`);
    }
  }
}

class Character {}

const WALL = Symbol('WALL');
const NOTHING = Symbol('NOTHING');

function loadMapFromASCII (ascii: string) {
  const trimmed = misc.trimChar(ascii, '\n');
  const rowStrings = trimmed.split('\n');
  const height = rowStrings.length;
  const width = rowStrings.map(rowString => rowString.length).reduce((a, b) => Math.max());
  return new Map(width, height, ([x, y], map) => {
    const tile = new Tile([x, y], map);
    if (x < rowStrings[y].length && rowStrings[y][x] === '#') {
      tile.type = WALL;
    } else {
      tile.type = NOTHING;
    }
    return tile;
  });
}

const map = loadMapFromASCII(`
##########
#        #
# ##     #
# #   #  #
#    #   #
#   #    #
#  #   # #
#     ## #
#        #
##########
`);

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

class MapView {
  _ctx: CanvasRenderingContext2D;
  _map: Map;
  domElement: HTMLCanvasElement;

  constructor(map) {
    this.map = map;
    this.domElement = dom.canvas({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      style: {
        border: '1px solid #ccc',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
      }
    });
    this._ctx = this.domElement.getContext('2d');
  }

  set map(map: Map) { this._map = map; }
  get map() { return this._map; }

  render() {
    const ctx = this._ctx;
    const canvas = this.domElement;
    const map = this.map;
    const x_scale = canvas.width / map.width;
    const y_scale = canvas.height / map.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < map.height; y++) {
      const cy = y_scale * y;
      for (let x = 0; x < map.width; x++) {
        const cx = x_scale * x;
        if (map.getTile(x, y).type === WALL) {
          ctx.fillRect(cx, cy, x_scale, y_scale);
        }
      }
    }
  }
}



/*
const counter = dom.span('0');
const button = dom.button(
  'Click me!',
  {style: {
    fontSize:     '20px',
    background:   '#6666cc',
    padding:      '10px',
    color:        'white',
    border:       '#3366cc',
    borderRadius: '10px',
  }},
  {click: () => counter.textContent = (+counter.textContent) + 1 + ''}
);

document.body.appendChild(dom.div(
  dom.h1(
    'Hello world!',
    {style: {
      'text-align': 'center'
    }}
  ),
  dom.p(
    'You have clicked the button ',
    counter,
    ' times'
  ),
  dom.p('----->', button, '<----')
));*/

const view = new MapView(map);
document.body.appendChild(view.domElement);
view.render();
