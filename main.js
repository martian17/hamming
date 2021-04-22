

var Hamming = function(n){//2 to the n  bits of parity
    var blockSize = 1<<n;
    var blockDataSize = blockSize - n;
    this.encode = function(bits){
        var arr = [];
        var idx = 0;//index of the bit
        
        while(idx < bits.length){
            var block = [];
            arr.push(block);
            var cnt = 0;
            var prev = 0;
            for(var i = 0; i < n; i++){
                var thisval = 1<<i;
                for(var j = prev; j < thisval; j++){
                    block[j] = bits[idx] || 0;
                    idx++;
                    //nowincrementing the parity bits
                    for(var k = 0; k < n; k++){
                        //xor equal
                        block[1<<k] ^= ((j>>k)&1)&(bits[idx] || 0);
                    }
                }
                prev = thisval+1;
            }
            //block filled
        }
        return arr;
    };
    
    this.decode = function(bits){
        
    };
};

var hamming = new Hamming(5);

var data = hamming.encode([0,1,1,0,1,0,1,0]);

console.log(data);
