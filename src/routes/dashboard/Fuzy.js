import isObject from 'lodash/isObject';

export default class Fuzy {
  getSet(number) {
    let _number = number;
    if (!isObject(_number)) {
      _number = {
        number: number,
        deltaMin: 0,
        deltaMax: 0,
      };
    }
    return _number;
  }

  add(fOne, fTwo) {
    let _fOne = fOne;
    let _fTwo = fTwo;
    _fOne = this.getSet(_fOne);
    _fTwo = this.getSet(_fTwo);
    return {
      number: _fOne.number + _fTwo.number,
      deltaMin: Math.round((_fOne.deltaMin + _fTwo.deltaMin) * 1000) / 1000,
      deltaMax: Math.round((_fOne.deltaMax + _fTwo.deltaMax) * 1000) / 1000,
    };
  }

  sub(fOne, fTwo) {
    let _fOne = fOne;
    let _fTwo = fTwo;
    _fOne = this.getSet(_fOne);
    _fTwo = this.getSet(_fTwo);

    return {
      number: Math.round((_fOne.number - _fTwo.number) * 1000) / 1000,
      deltaMin: Math.round((_fOne.deltaMin + _fTwo.deltaMin) * 1000) / 1000,
      deltaMax: Math.round((_fOne.deltaMax + _fTwo.deltaMax) * 1000) / 1000,
    };
  }

  mul(fOne, fTwo) {
    let _fOne = fOne;
    let _fTwo = fTwo;
    _fOne = this.getSet(_fOne);
    _fTwo = this.getSet(_fTwo);

    return {
      number: Math.round(_fOne.number * _fTwo.number * 1000) / 1000,
      deltaMin:
        Math.round(
          (_fOne.deltaMin * _fTwo.number + _fTwo.deltaMin * _fOne.number) *
            1000,
        ) / 1000,
      deltaMax:
        Math.round(
          (_fOne.deltaMax * _fTwo.number + _fTwo.deltaMax * _fOne.number) *
            1000,
        ) / 1000,
    };
  }
}
