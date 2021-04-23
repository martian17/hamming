var BitField = function(n){
    var floats = Math.ceil(n/64)+1;//extra bits reserved for rng
    var buff = new ArrayBuffer(floats*8);
    var floatView = new Float64Array(buff);
    var int8View = new Uint8Array(buff);
    var intView = new Int32Array(buff);
    this.uint8 = int8View;
    var that = this;
    
    var rule = [
        0,1,1,1,1,0,0,0
    ];
    
    this.setRandomBits = function(){
        for(var i = 0; i < (floats-1)*2; i++){//x2 because float is twice as long as int
            floatView[floats-1] = Math.random();
            int8View[(floats-1)*8] = int8View[(floats-1)*8+4];
            intView[i] = intView[(floats-1)*2];
        }
    };
    this.fill0 = function(){
        for(var i = 0; i < (floats-1)*2; i++){
            intView[i] = 0;
        }
    };
    this.fill1 = function(){
        for(var i = 0; i < (floats-1)*2; i++){
            intView[i] = -1;//2's complement
        }
    };
    this.get = function(idx){
        var i = idx>>5;//divide by 32
        var j = idx%32;
        return (intView[i]>>j)&1;
        //return Math.random()>0.5?0:1;
    };
    this.set = function(idx){
        var i = idx>>5;//divide by 32
        var j = idx%32;
        intView[i] |= (1<<j);
    };
    this.clear = function(idx){
        var i = idx>>5;//divide by 32
        var j = idx%32;
        intView[i] &= ~(1<<j);
    };
    this.invert = function(idx){
        var i = idx>>5;//divide by 32
        var j = idx%32;
        intView[i] ^= 1<<j;
    };
    this.getBitList = function(){
        var arr = [];
        for(var idx = 0; idx < n; idx++){
            var i = idx>>5;//divide by 32
            var j = idx%32;
            arr[idx] = (intView[i]>>j)&1;
        }
        return arr;
    };
    this.get2bits = function(idx){
        var i = idx>>3;//divide by 8
        var j = idx%8;
        var val = (int8View[i]|(int8View[i+1]<<8));
        return (val>>j)&3;//7 because 3 bits
    };
    this.stepCellAuto = function(){
        var first = that.get(0);
        var second = that.get(1);
        var secondLast = that.get(n-2);
        var last = that.get(n-1);
        var lastBit = first;//first bit
        for(var i = 1; i < n-1; i++){
            var thisbits = lastBit|(that.get2bits(i)<<1);
            lastBit = (thisbits>>1)&1;
            if(rule[thisbits]){
                that.set(i);
            }else{
                that.clear(i);
            }
        }
        
        //first bit
        if(rule[(last|(first<<1))|second<<2]){
            that.set(0);
        }else{
            that.clear(0);
        }
        //last bit
        if(rule[(secondLast|(last<<1))|first<<2]){
            that.set(n-1);
        }else{
            that.clear(n-1);
        }
    };
};

module.exports = BitField;