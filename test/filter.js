
/**
 * Test dependencies.
 */

var filter = require('../filter')
  , ops = filter.ops
  , expect = require('expect.js');

/**
 * Test.
 */

describe('filter', function(){

  describe('ops', function(){
    it('ne', function(){
      expect(ops.$ne(3, 4)).to.be(true);
      expect(ops.$ne(3, 3)).to.be(false);
      expect(ops.$ne({}, {})).to.be(false);
      expect(ops.$ne(null, undefined)).to.be(false);
    });

    it('gt', function(){
      expect(ops.$gt(4, 5)).to.be(true);
      expect(ops.$gt(4, 4)).to.be(false);
    });

    it('gte', function(){
      expect(ops.$gte(4, 5)).to.be(true);
      expect(ops.$gte(4, 4)).to.be(true);
      expect(ops.$gte(5, 4)).to.be(false);
    });

    it('lt', function(){
      expect(ops.$gt(4, 5)).to.be(true);
      expect(ops.$gt(4, 4)).to.be(false);
    });

    it('lte', function(){
      expect(ops.$gt(4, 5)).to.be(true);
      expect(ops.$gt(4, 4)).to.be(false);
    });

    it('exists', function(){
      expect(ops.$exists(true, true)).to.be(true);
      expect(ops.$exists(true, undefined)).to.be(false);
      expect(ops.$exists(false, true)).to.be(false);
      expect(ops.$exists(true, true)).to.be(true);
      expect(ops.$exists(false, null)).to.be(false);
      expect(ops.$exists(false, undefined)).to.be(true);
      expect(ops.$exists(false, 0)).to.be(false);
    });

    it('in', function(){
      expect(ops.$in([1,2,3], 1)).to.be(true);
      expect(ops.$in([1,2,3], '')).to.be(false);
      expect(ops.$in([1,null,3], undefined)).to.be(true);
      expect(ops.$in([], '')).to.be(false);
    });

    it('nin', function(){
      expect(ops.$nin([1,2,3], 1)).to.be(false);
      expect(ops.$nin([1,2,3], '')).to.be(true);
      expect(ops.$nin([1,null,3], undefined)).to.be(false);
      expect(ops.$nin([], '')).to.be(true);
    });

    it('regex', function(){
      expect(ops.$regex('test', 'testing')).to.be(true);
      expect(ops.$regex('[0-9]', 'testing')).to.be(false);
      expect(ops.$regex('[0-9]', 't3sting')).to.be(true);
    });
  });

  describe('arrays', function(){
    it('simple', function(){
      var ret = filter({
        a: {
          b: [1, 2, 3, 1]
        }
      }, { 'a.b': 1 });

      expect(ret).to.eql({ 'a.b': [1, 1] });
    });

    it('subdocuments', function(){
      var ret = filter({
        a: {
          b: {
            c: [
              { d: 5, hello: 'world' },
              { d: 3, hello: 'world 2' },
              { d: 5, tobi: 'ferret' },
            ]
          }
        }
      }, { 'a.b.c.d': 5 });

      expect(ret).to.eql({ 'a.b.c.d': [
        { d: 5, hello: 'world' },
        { d: 5, tobi: 'ferret' }
      ] });
    });

    it('query operators', function(){
      var ret = filter({
        ferrets: [
          { name: 'tobi' },
          { name: 'loki' },
          { name: 'jane', likes: ['food'] }
        ]
      }, { 'ferrets.likes': { $exists: true } });

      expect(ret).to.eql({
        ferrets: [{ name: 'jane', likes: ['food'] }]
      });
    });

    it('query subset narrow down', function(){
      var ret = filter({
        ferrets: [
          { name: 'tobi', age: 5 },
          { name: 'tobo', age: 4 },
          { name: 'tomas', age: 10 }
        ]
      }, { 'ferrets.name': /^t/, 'ferrets.age': { $lt: 8 } });

      expect(ret).to.eql({
        ferrets: [{ name: 'tobi', age: 5 }, { name: 'tobo', age: 4 }]
      });
    });

    it('multiple matches', function(){
      var ret = filter({
        ferrets: [
          { name: 'tobi', age: 5 },
          { name: 'loki', age: 3 },
          { name: 'jane', age: 8 }
        ],
        people: [
          { name: 'tj', programmer: true },
          { name: 'marco', programmer: true },
          { name: 'thianh', programmer: false },
          { name: 'meredith', programmer: false }
        ]
      }, { 'ferrets.age': { $gte: 5 }, 'people.programmer': true });

      expect(ret).to.eql({
        ferrets: [{ name: 'jane' }],
        people: [
          { name: 'tj', programmer: true },
          { name: 'marco', programmer: true }
        ]
      });
    });
  });

});
