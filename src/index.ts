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

  _width: number;
  _height: number;
  _tiles: Tile[][];
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

class MapView {
  _map: Map;

  constructor(map) {
    this.map = map;
  }

  set map(map: Map) { this._map = map; }
  get map() { return this._map; };
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

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const canvas = dom.canvas({
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  style: {
    border: '1px solid #ccc',
    boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
  }
});

document.body.appendChild(canvas);
