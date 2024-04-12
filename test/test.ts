import Heap from '../src/heap';

const heap = new Heap<{ id: string, deadline: number }, string>(( a, b ) => a.deadline - b.deadline, i => i.id );

heap.push({ id: '1', deadline: 1 });
heap.update({ id: '1', deadline: 1 });
heap.update({ id: '1', deadline: 1 });
//heap.pop();
heap.push({ id: '2', deadline: 1 });