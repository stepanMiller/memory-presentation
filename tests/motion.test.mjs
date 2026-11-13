import test from 'node:test';
import assert from 'node:assert/strict';
import {vascularFrame,manualPosition,gestureDirection,timelinePosition} from '../src/motion.mjs';
import {story} from '../src/story.mjs';
test('Vascular illustration does not morph two different anatomical models together',()=>{
 for(let p=0;p<=2;p+=.005){const f=vascularFrame(p);assert.ok(!(f.brainOpacity>.01&&f.arteryOpacity>.01));if(f.arteryOpacity>.05)assert.ok(f.context>.9);}
});
test('Direct brain-to-artery transition pauses on the surface reference area',()=>{
 const duration=2700;assert.equal(manualPosition(0,2,duration*.48,duration),1);
 assert.equal(manualPosition(0,2,duration,duration),2);
 assert.equal(manualPosition(2,0,duration*.48,duration),1);
 assert.equal(manualPosition(2,0,duration,duration),0);
});
test('Vertical and ambiguous gestures preserve normal page scrolling',()=>{
 assert.equal(gestureDirection(20,-180),0);assert.equal(gestureDirection(70,60),0);
 assert.equal(gestureDirection(-100,10),1);assert.equal(gestureDirection(100,10),-1);
});
test('Guided duration is within the approved four-to-five-minute range',()=>{
 const seconds=story.reduce((n,s)=>n+s.duration,0);assert.ok(seconds>=240&&seconds<=300);
 assert.equal(seconds,268);assert.equal(story.length,8);assert.equal(story.reduce((n,s)=>n+s.states.length,0),24);
});
test('Every timeline reaches its final state and stays within bounds',()=>{
 for(const s of story){let last=0;for(let t=0;t<=s.duration*1000;t+=31){const p=timelinePosition(t,s.states.length,s.duration*1000);assert.ok(p>=last&&p<=s.states.length-1);last=p;}assert.equal(timelinePosition(s.duration*1000,s.states.length,s.duration*1000),s.states.length-1);}
});
