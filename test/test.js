'use strict';

var circularBFS = require('../json-references');
var chai = require ('chai');
var _ = require('lodash');
var expect = chai.expect;

describe('Transform JSON non-circular references.', function () {

    it('First-level references.', function (done) {

        var original = _.cloneDeep(require ('./original.json'));
        var correctAnswer = _.cloneDeep(original);

        //Insert references in our JSON
        original[0]['friend'] = original[1];
        original[1]['friend'] = original[2];
        original[2]['friend'] = original[3];
        correctAnswer[0]['friend'] = "$[1]";
        correctAnswer[1]['friend'] = "$[2]";
        correctAnswer[2]['friend'] = "$[3]";

        var result = circularBFS(original);

        //Verification
        expect(result).to.deep.equal(correctAnswer);

        done();
    });

    it('Second-level references.', function (done) {

        var original = _.cloneDeep(require ('./original.json'));
        var correctAnswer = _.cloneDeep(original);

        //Insert references in our JSON
        original[0]['friends'][0] = original[2];
        original[1]['friends'][0] = original[4];
        original[0]['friends'][1] = original[3];
        correctAnswer[0]['friends'][0] = "$[2]";
        correctAnswer[1]['friends'][0] = "$[4]";
        correctAnswer[0]['friends'][1] = "$[3]";

        //Run algorithm and get the result
        var result = circularBFS(original);

        //Verification
        expect(result).to.deep.equal(correctAnswer);

        done();
    });
});

describe('Transform JSON circular references.', function () {

    it('Links to parent JSON.', function (done) {

        var original = _.cloneDeep(require ('./original.json'));
        var correctAnswer = _.cloneDeep(original);
        var wrongAnswer = _.cloneDeep(original);

        var next;

        //Insert circularity in our JSON
        for (var index in original) {
            if(original.hasOwnProperty(index)) {
                original[index]['myself'] = original[index];
                correctAnswer[index]['myself'] = "$[" + index +"]";
                next = index+1;
                wrongAnswer[index]['myself'] = "$ [" + next + "]";
            }
        }

        var result = circularBFS(original);

        //Verification
        expect(result).to.deep.equal(correctAnswer);
        expect(result).not.to.deep.equal(wrongAnswer);

        done();
    });

    it('Links of type A->B->C->...->A.', function (done) {

        var original = _.cloneDeep(require ('./original.json'));
        var correctAnswer = _.cloneDeep(original);
        var wrongAnswer = _.cloneDeep(original);

        var next;

        //Insert circularity in our JSON
        for (var index in original) {
            if(original.hasOwnProperty(index)) {
                next = (index+1)%10;
                original[index]['next'] = original[next];
                correctAnswer[index]['next'] = "$[" + next + "]";
                wrongAnswer[index]['next'] = "REFERENCE = JSON." + index; //space extra
            }
        }

        var result = circularBFS(original);

        //Verification
        expect(result).to.deep.equal(correctAnswer);
        expect(result).not.to.deep.equal(wrongAnswer);

        done();
    });

    it('Same as before but backwards.', function (done) {

        var original = _.cloneDeep(require ('./original.json'));
        var correctAnswer = _.cloneDeep(original);
        var wrongAnswer = _.cloneDeep(original);

        var previous;

        //Insert circularity in our JSON
        for (var index in original) {
            if(original.hasOwnProperty(index)) {
                previous = (index-1+10)%10;
                original[index]['previous'] = original[previous];
                correctAnswer[index]['previous'] = "$[" + previous + "]";
                wrongAnswer[index]['previous'] = "$[" + index +"]"; //space extra
            }
        }

        var result = circularBFS(original);

        //Verification
        expect(result).to.deep.equal(correctAnswer);
        expect(result).not.to.deep.equal(wrongAnswer);

        done();
    });

});

describe('Verify correct order of references from BFS algorithm.', function () {

    it('Repetition in lower levels must be replaced.', function (done) {

        var original = _.cloneDeep(require ('./original.json'));
        var correctAnswer = _.cloneDeep(original);
        var wrongAnswer = _.cloneDeep(original);

        //Insert circularity in our JSON
        for (var index in original) {
            if(original.hasOwnProperty(index)) {
                original[index]['friend'] = original[index]['friends'][2];
                correctAnswer[index]['friend'] = correctAnswer[index]['friends'][2];
                correctAnswer[index]['friends'][2] = "$["+index+"].friend";
                wrongAnswer[index]['friend'] = "$["+index+"].friends[2]"; //space extra
            }
        }

        var result = circularBFS(original);

        //Verification
        expect(result).to.deep.equal(correctAnswer);
        expect(result).not.to.deep.equal(wrongAnswer);

        done();
    });

});