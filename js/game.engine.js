var 
	game = {},
	ANN = {
		const : {
			WIN : 1,
			THROW : 2,
			PASS : 3,
			ETHROW : 4,
			DRAW : 5,
			LOSE : 6
		},
		ToStep : function (dot,way,p) {
				var c = game.const,
							c2 = ANN.const,
							flag=false, 
							chg, res=c2.PASS;
						
						for (var i=0; i<way.length/2; ++i)
						{
							chg=game.checkgoal(way[way.length/2+i],p);
							if (chg[0] == true &&  chg[1] == (p==1?0:1)) flag=true;
						}
						if (flag==true) res=c2.LOSE;
						flag=false;
						for (var i=0; i<way.length/2; ++i)
						{
							chg=game.checkgoal(way[way.length/2+i],p);
							if (chg[0] == true && chg[1] == p) flag=true;
						}
						if (flag==true && res==c2.PASS) res=c2.WIN;
						var d1=dot,d2;
						for (var i=0; i<way.length/2; ++i)
						{
							d2=way[way.length/2+i];
							game.data(d2,{p:game.o2n(d1),t:c.dotused});
							d1=d2;
						}
						if (res == c2.PASS)
						{
							var chkst = game.checkstep(d2,0);
							if (chkst==0) res=c2.DRAW;
							if (chkst==1) res=c2.THROW;
						}
						for (var i=0; i<way.length/2; ++i)
						{
							game.data(way[way.length/2+i],{p:game.o2n(way[way.length/2+i]),t:c.dotfree});
						}	
						return res;
					},
		pass : [
			//Random
			function (dot,p) {
				var 
					c = game.const,
					c2 = ANN.const,
					ways = game.getposssteps(dot);/*,
					ToStep = ANN.ToStep;*/
				/*for (var i=0; i<ways.length; ++i)
				{
					ways[i].tstep=ToStep(dot,ways[i],p);
				}
				ways=ways.sort(function(a,b){
						return a.tstep-b.tstep;
				});*/
				/*if (ways[0].tstep<c2.DRAW && ways[0].tstep>c2.WIN)	
				{
					var k=1;
					while (k < ways.length && ways[k].tstep<c2.DRAW) {++k}
					return  ways[Math.round(Math.random()*(k-1))];
				}*/
				return ways[Math.round(Math.random()*(ways.length-1))];
			},
			//checking one step
			function (dot,p) {
				var 
					c = game.const,
					c2 = ANN.const,
					ways = game.getposssteps(dot),
					ToStep = ANN.ToStep;
				for (var i=0; i<ways.length; ++i)
				{
					ways[i].tstep=ToStep(dot,ways[i],p);
				}
				ways=ways.sort(function(a,b){
						return a.tstep-b.tstep;
				});
					var k=1;
					while (k < ways.length && ways[k].tstep == ways[0].tstep) {++k}
					return  ways[Math.round(Math.random()*(k-1))];
				return ways[0];
			},
			//checking two steps
			function (dot,p){
				return ANN.pass[4](dot,p,3);
			},
			function (dot,p){
				return ANN.pass[4](dot,p,0.5);
			},
			function (dot,p,ANNcoeff) {
				var 
					c = game.const,
					c2 = ANN.const,
					ways = game.getposssteps(dot),
					ToStep = ANN.ToStep;
				if (ANNcoeff==undefined)
				{
					var ANNcoeff=0.2;
				}
				var 
				p0=p==1?0:1,
							gate0 = game.const.gates[p],
							gd = game.data(gate0);
				for (var i=0; i<ways.length; ++i)
				{
					ways[i].tstep=ToStep(dot,ways[i],p);
					if (ways[i].tstep<c2.PASS || ways[i].tstep>c2.ETHROW) 
					{
						ways[i].edist=Number.MAX_VALUE;
						continue;
						
					}
					var way = ways[i],d2,d1=dot,ways0;
					//let we use this way
					for (var k=0; k<way.length/2; ++k)
					{
						d2=way[way.length/2+k];
						game.data(d2,{p:game.o2n(d1),t:c.dotused});
						d1=d2;
					}
					
					//check all possible variants of enemy
					var dot0 = d2;
					ways0=game.getposssteps(dot0); 
					//counting rate for every dots and distance to the middle of enemy gate
					for (var j=0; j<ways0.length; ++j)
					{
						ways0[j].tstep=ToStep(dot0,ways0[j],p0);
						ways0[j].distance=(function(){ //distance to the middle of enemy gate
						var d = game.data(ways0[j][ways0[j].length-1]);
							return Math.sqrt((d.x-gd.x1)*(d.x-gd.x1)+(d.y-(gd.y1+gd.y2)/2 )*(d.y-(gd.y1+gd.y2)/2 ));
						})();
					}
					ways0=ways0.sort(function(a,b){
						if (a.tstep==b.tstep)
						{
							return a.distance-b.distance; //the way with the greatest distance
						}
						else 
						{
							return a.tstep-b.tstep;
						}
					});
					var s='/---------------------- '+ways[i]+' type='+ways[i].tstep+'\n';
				/*for (var ii=0;ii<ways0.length;++ii)
				{
					s+=ways0[ii]+' type='+ways0[ii].tstep+' distance='+ways0[ii].distance+'\n'
				}
				*/
				//console.log(s+'\n\\-------------');
					if (ways0.length>0) {
					var bway0 = ways0[0];
					way.edist = bway0.distance;
					switch (bway0.tstep)
					{
						case c2.WIN: way.tstep=c2.LOSE; break;
						case c2.LOSE: way.tstep=c2.WIN; break;
						case c2.DRAW: if (way.tstep!=c2.WIN && way.tstep!=c2.LOSE) way.tstep=c2.DRAW; break;
						case c2.THROW: way.tstep=c2.ETHROW; break;
						case c2.PASS: break;
					}
				}
				else
				{
					way.edist=Number.MAX_VALUE;
				}	
					//let turn back all step with this way
					for (var k=0; k<way.length/2; ++k)
					{
						game.data(way[way.length/2+k],{p:game.o2n(way[way.length/2+k]),t:c.dotfree});
					}
				}
				ways=ways.sort(function(a,b){
					if (a.tstep==b.tstep )					
					{
						return b.edist-a.edist;
					}
					else
					{
						return a.tstep-b.tstep;
					}
				});
				var s='';
				for (var i=0;i<ways.length;++i)
				{
					s+=ways[i]+' type='+ways[i].tstep+' edist='+ways[i].edist+'\n'
				}
				console.log(s);
				//if (ToStep(dot,ways[0],p)==c2.PASS)
				//{
					var k=1;
					while (k < ways.length && ways[k].tstep == ways[0].tstep && Math.abs(ways[k].edist-ways[0].edist)<ANNcoeff) {++k}
					return  ways[Math.round(Math.random()*(k-1))];
				//}	
				return ways[0];
			}
			
		],
		throw : [
			//Random
			function (dot,p) {
				var
					c = game.const,
					c2 = ANN.const,
					ToStep = ANN.ToStep,
					ways = game.getpossthrow(dot);
				for (var i=0; i<ways.length; ++i)
				{
					ways[i].tstep=ToStep(dot,ways[i],p);
				}
				ways=ways.sort(function(a,b){
						return a.tstep-b.tstep;
				});
				if (ways[0].tstep<c2.DRAW && ways[0].tstep>c2.WIN)	
				{
					var k=1;
					while (k < ways.length && ways[k].tstep<c2.DRAW) {++k}
					return  ways[Math.round(Math.random()*(k-1))];
				}				
				return ways[0];
			},		
			//checking one step
			function (dot,p) {
				var
					c = game.const,
					c2 = ANN.const,
					ToStep = ANN.ToStep,
					ways = game.getpossthrow(dot);
				for (var i=0; i<ways.length; ++i)
				{
					ways[i].tstep=ToStep(dot,ways[i],p);
				}
				ways=ways.sort(function(a,b){
						return a.tstep-b.tstep;
					/*}*/
				});				
				return ways[0];
			},
			//checking two steps
			function (dot,p){
				return ANN.throw[4](dot,p,3);
			},
			function (dot,p){
				return ANN.throw[4](dot,p,0.5);
			},			
			function (dot,p,ANNcoeff) {
				var
					c = game.const,
					c2 = ANN.const,
					ToStep = ANN.ToStep,
					ways = game.getpossthrow(dot);
				if  (ANNcoeff == undefined)	
				{
					var ANNcoeff=0.5;
				}
				var p0=p==1?0:1,
							gate0 = game.const.gates[p],
							gd = game.data(gate0);
				for (var i=0; i<ways.length; ++i)
				{
					ways[i].tstep=ToStep(dot,ways[i],p);
					if (ways[i].tstep<c2.PASS || ways[i].tstep>c2.ETHROW) 
					{
						ways[i].edist=Number.MAX_VALUE;
						continue;
						
					}
					var way = ways[i],d2,d1,ways0;
					//let we use this way
					//the dot will not be marked
					d1=way[way.length/2+0];
					for (var k=0; k<way.length/2; ++k)
					{
						d2=way[way.length/2+k];
						game.data(d2,{p:game.o2n(d1),t:c.dotused});
						d1=d2;
					}
					
					//check all possible variants of enemy
					var dot0 = d2;
					ways0=game.getposssteps(dot0); 
					//counting rate for every dots and distance to the middle of enemy gate
					for (var j=0; j<ways0.length; ++j)
					{
						ways0[j].tstep=ToStep(dot0,ways0[j],p0);
						ways0[j].distance=(function(){ //distance to the middle of enemy gate
						var d = game.data(ways0[j][ways0[j].length-1]);
							return Math.sqrt((d.x-gd.x1)*(d.x-gd.x1)+(d.y-(gd.y1+gd.y2)/2 )*(d.y-(gd.y1+gd.y2)/2 ));
						})();
					}
					ways0=ways0.sort(function(a,b){
						if (a.tstep==b.tstep)
						{
							return a.distance-b.distance; //the way with the greatest distance
						}
						else 
						{
							return a.tstep-b.tstep;
						}
					});
					var s='/---------------------- '+ways[i]+' type='+ways[i].tstep+'\n';
					for (var ii=0;ii<ways0.length;++ii)
					{
						s+=ways0[ii]+' type='+ways0[ii].tstep+' distance='+ways0[ii].distance+'\n'
					}
					
					console.log(s+'\n\\-------------');
					if (way.tstep!=c2.THROW) {
						var bway0 = ways0[0];
						way.edist = bway0.distance;
						switch (bway0.tstep)
						{
							case c2.WIN: way.tstep=c2.LOSE; break;
							case c2.LOSE: way.tstep=c2.WIN; break;
							case c2.DRAW: if (way.tstep!=c2.WIN && way.tstep!=c2.LOSE) way.tstep=c2.DRAW; break;
							case c2.THROW: way.tstep=c2.ETHROW; break;
							case c2.PASS: break;
						}
					}
					else
					{
						way.edist=Number.MAX_VALUE;
					}	
					//let turn back all step with this way
					for (var k=0; k<way.length/2; ++k)
					{
						game.data(way[way.length/2+k],{p:game.o2n(way[way.length/2+k]),t:c.dotfree});
					}
				}
				ways=ways.sort(function(a,b){
					if (a.tstep==b.tstep )					
					{
						return b.edist-a.edist;
					}
					else
					{
						return a.tstep-b.tstep;
					}
				});
				var k=1;
				while (k < ways.length && ways[k].tstep == ways[0].tstep && Math.abs(ways[k].edist-ways[0].edist)<ANNcoeff) {++k}
				return  ways[Math.round(Math.random()*(k-1))];	
				//way = ways[0]; //x,da
				//return way;
			}
		]
	},
	idg = 'game_field';
	dots = [];
Array.prototype.copy=function(){return JSON.parse(JSON.stringify(this));}
game.const = {
	name : [
		'1st player',
		'2nd player'
	],
	tplayer: [
		'man',
		'man'
	],
	bname : [
		'Random bot',
		'One step bot',
		'Super bot 0.3',
		'Super bot 2.5',
		'Super bot 5.0',
		'Human',
	],
	bdiff : [
		5,
		5
	],
	width : 1050, //width of field
	height : 600, // height of field
	nvl : 39, // number of verticAL lines olny odd
	nhl : 21, // number of horizontal liness
	lind : 5, // left indent
	tind: 5, // top indent
	rind : 1, // right indent
	bind : 1, // bottom indent
	vind : 38, // vertical indent
	hind : 38, // horizontal indent
	colorv : '#45a4bc', //color of vertical lines
	colorh : '#45a4bc', // color of horizontal lines
	colorg : ['#f00','#00f'], // color of gates
	colorml : '#1f1', // color of middle line
	mlw : 1, // color of gates
	colorb : '#000000', // color of borders
	colord : '#000', // color of dots
	colorp : '#1f1', // color of possible dots
	colora : '#fff', // color of active dot
	layers : { // number of layers different objects
		back : 0,
		gate : 1,
		line : 2,
		dot : 3
	},
	elem : {
		line : ['#f00','#00f'],
		dot : ['#f00','#00f']
	}, // players elems
	rd : 3 , //radius of dots
	addrd : 12 , //radius of add dots
	dotused : 'used' , //dot is used
	dotfree : 'free' , //dot is free
	dotactive : 'active' , //dot is activated
	neib : [-1,0,-1,1,0,1,1,1,1,0,1,-1,0,-1,-1,-1],
	widthg : 4, // width of gate
	longg : 3, // long of throw
	linew : 3, // width of line
	longt : 6 // long of throw
//	linecolor : '#ff0000'
}
/*game.undo = [
	0,
	function(dot) {
		var 
			de = game.data(dot).ld,
			c=game.const,
			* 
			* 
			* 
			
			
			
			
			
			
			c2=ANN.const,
			p=game.data(dot).lp;
		if (game.undo[0]<=0)
		{
			game.undo[0]=0;
			return [dot,p];
		}
		while (game.data(dot).p!=game.data(dot).id && game.data(de).id!=game.data(dot).id)
		{
			game.data(dot).line.del();
			game.data(dot.color(c.colord),{t:c.dotfree});
			dot=game.n2o(game.data(dot).p);
		}
		game.data(dot,{t:c.dotactive});
		if (game.undo[0]>0) game.undo[0]--;
		if (game.undo[0]<=0) 
		{
			game.undo[0]=0;
			$('#undo').val('Undo');
		}
		
		return [dot,p];
	}
];*/
game.data =function (o,d){
	if (d==undefined) return	o.data
	else {
		var _d = (o.data==undefined)?{}:o.data; 
		for (var k in d)
		{
			if (k!=undefined) 	_d[k]=d[k];
		}
		o.data=_d;
		return null;
	}
}
game.o2n = function(o) {
	var 
		data = game.data(o),
		name = data.x+','+data.y;
	return name;
}
game.triggers = {
	out:{},
	over:{},
	down:{},
	up:{},
	move:{}
};
game.draw = function () {
	alert('Draw');
}
game.actions = function (c,e,action) {
	if (game.triggers[action]['all'] != undefined) {
		game.triggers[action]['all'].call(c,e.action);
	}
	if (game.triggers[action][game.o2n(c)] != undefined) {
		game.triggers[action][game.o2n(c)].call(c,e.action);
	}
}
game.line=function(d1,d2,cl,cd1,cd2,t1,t2){
	var line = jc.line([[d1._x,d1._y],[d2._x,d2._y]],cl); // draw line
	d1.color(cd1); // set color for d1
	d2.color(cd2); // set color for d2 
	//jc.start(idg); // update scene
	// write data about type of dote
	game.data(d1,{t:t1});
	game.data(d2,{t:t2,p:game.o2n(d1),line:line});
	return line;
}
game.isconnected = function(d1,d2) {
	var 
		data1 = game.data(d1),
		data2 = game.data(d2);
	return !(data1.p != data2.id &&  data2.p != data1.id);
}
game.getpossthrow = function(dot) {
	var
		c=game.const,
		wayouts = [],
		x0,y0,
		t=game.data(dot).t,
		x=game.data(dot).x,
		y=game.data(dot).y;
		//game.data(dot,{t:c.dotused});
	for (var i=0; i<8; ++i)
	{
		x0=x+(c.longt+1)*c.neib[2*i]; y0=y+c.neib[2*i+1]*(c.longt+1);
		k = 1;
		while ((x0!=x || y0 !=y) && k < c.longt)
		{
			++k;
			x0-=c.neib[2*i];
			y0-=c.neib[2*i+1];
			if (game.exist(x0,y0) != null) dn = game.exist(x0,y0)
			else continue;
			if (game.data(dn).t == c.dotfree) //if only with c.longt edges
			{
				wayouts.push([i,dn]);
				break;
			}
			
		}
	}
	game.data(dot,{t:t});
	return wayouts;
}
game.getposssteps = function (dot) {
	var 
		c = game.const,
		neib = c.neib,
		checkline = game.checkline,
		wayouts = [], t=game.data(dot).t;
		game.data(dot,{t:c.dotused});
		for (var x=0;x<8;++x)
		{
			if ((da=game.exist(game.data(dot).x+neib[x*2],game.data(dot).y+neib[x*2+1])) != null && game.data(da).t == c.dotfree && checkline(dot,da))
					game.data(da,{t:c.dotused,p:game.data(dot).id})
			else continue;
			for (var y=0;y<8;++y)
			{
				if ((db=game.exist(game.data(da).x+neib[y*2],game.data(da).y+neib[y*2+1])) != null && game.data(db).t == c.dotfree && checkline(da,db))
					game.data(db,{t:c.dotused,p:game.data(da).id})
				else continue;				
				for (var z=0;z<8;++z)
				{
					if ((dc=game.exist(game.data(db).x+neib[z*2],game.data(db).y+neib[z*2+1])) != null && game.data(dc).t == c.dotfree && checkline(db,dc))
						game.data(dc,{t:c.dotused,p:game.data(db).id})
					else continue;									
					wayouts.push([x,y,z,da,db,dc]);
					game.data(dc,{p:game.data(dc).id,t:c.dotfree});
				}
				game.data(db,{p:game.data(db).id,t:c.dotfree});
			}
			game.data(da,{p:game.data(da).id,t:c.dotfree});
		}
	game.data(dot,{t:t});
	return wayouts;
}
game.checkstep = function(dot,depth) {
	var 
		c = game.const,
		neib = c.neib;
	//if (game.data(dot).t == c.dotused) return 1;
	game.checkline = function (d1,d2) {
		if (game.data(d2).t == c.dotfree)
			{
				var
					x1 = game.data(d1).x,
					y1 = game.data(d1).y,
					x2 = game.data(d2).x,
					y2 = game.data(d2).y;
				if ((x1==x2 || y1==y2) || ! (game.isconnected(dots[x1][y2],dots[x2][y1])))
				{
					return true
				}
			}
		return false;
	}
	var checkline = game.checkline;
	function check (dot,deep) {
		var dn,res=1; // define vars
		
		if (deep==3) { // if deep == 3 then we can make polyline with 3 vertices
			return 2;
		}
		
		var // x and y - indexes of "dot"
			x=game.data(dot).x,
			y=game.data(dot).y;
		for (var i=0;i<8;i++) //check neibs of dot
		{
			
			if ((dn=game.exist(x+neib[i*2],y+neib[i*2+1])) != null && game.data(dn).t == c.dotfree && checkline(dot,dn)) //checking whether dn  exists
				 //checking whether we can connect this vertices
			{
				//var line = game.line(dot,dn,'#ff0',dot.attr('color'),dot.attr('color'),c.dotused,c.dotactive); // make line for  illustration
				game.data(dn,{t:c.dotused,p:game.data(dot).id});
				res = check(dn,deep+1); // res is equal to rec. checking next neib
				game.data(dn,{p:game.data(dn).id});
				game.data(dn,{t:c.dotfree}); // remove data that dot is used
				if (res==2) return 2; // if res equals 2 then we can make polyline with 3 vertices
			}
		}
		return res;
	}
	var res = check(dot,depth);
	if (res == 1 && depth == 0)
	{
		res=0;
		var data = game.data(dot), x=data.x, y=data.y, x0, y0,dn;
		for (var i=0; i<8; i++)
		{
			x0=x+(c.longt+1)*c.neib[2*i]; y0=y+c.neib[2*i+1]*(c.longt+1);
			var k = 0;
			while ((x0!=x || y0 !=y) && k < c.longt)
			{
				if (game.exist(x0-=c.neib[2*i],y0-=c.neib[2*i+1]) != null) dn = game.exist(x0,y0)
				else continue;
				//console.log(JSON.stringify(dn.data));
				if (game.data(dn).t == c.dotfree) //if only with c.longt edges
				{
					res=1;
					return res;
				}
				++k;
			}
		}
	}
	
	return res;
}
game.n2o = function (id) {
	var arr = id.split(',');
	return game.exist(arr[0],arr[1]);
}
game.exist = function (x,y) {
	var c = game.const;
	if (dots[x] != undefined && dots[x][y] != undefined)
	{
		return dots[x][y];
	}
	else
	{
		return null;
	}
}
game.color= function (o) {
	return 'rgba('+o.color().join(',')+')';
}
game.comppass = function(dot,p) {
	var 
		c = game.const,
		way = ANN.pass[c.bdiff[p]](dot,p),
		d1,d2;
	d1=dot;
	for (var i=0; i<way.length/2; ++i)
	{
		d2=way[way.length/2+i];
		//console.log(d1,d2,c.elem.line[p],c.elem.dot[p],game.color(d2),c.dotused,c.dotactive);
		game.line(d1,d2,c.elem.line[p],c.elem.dot[p],game.color(d2),c.dotused,c.dotactive).level(c.layers.line).lineStyle({lineWidth:c.linew});
		jc.start(idg);
		if (game.checkgoal(d2,p)[0] == true) return d2;
		d1=d2;
	}
	game.data(dot,{t:c.dotactive});
	return d2;
}
game.compthrow = function (dot,p) {
	var 
		c = game.const,
		way = ANN.throw[c.bdiff[p]](dot,p),
		d2 = way[1];
	game.data(dot,{t:c.dotused});
	game.data(d2,{t:c.dotactive});
	d2.color(c.color);
	return d2;
}
game.makecompstep = function(dot,p,cb0) {
	var c = game.const;
	//dot.color(c.colora);
	setTimeout(function(){dot.color(c.colorg[p]);},1);
	switch (game.checkstep(dot,0)) {
		case 2: console.log('start pass '+p); d2=game.comppass(dot,p); console.log('end pass '+p); break;
		case 1: console.log('start throw '+p); dot.color(c.colorg[p]); d2=game.compthrow(dot,p);  console.log('end throw'+p); break;
		default: cb0(false);
	}
	game.data(d2,{lp:p,ld:dot});
	
	cb0(d2,p);
	return null;
	
}
game.pass = function(dot,p,depth,cb0) { // make pass by ground
	// help: game.line=function(d1,d2,cl,cd1,cd2,t1,t2){
	var 
		c = game.const,
		neib = c.neib;
	//check all possible neibs
	function wait(d1,depth) { // every line start from this func
		var 
			data = game.data(d1), x=data.x,y=data.y,
			_neib = [],dn;// required vars
		//d1.color(c.dotactive); // set active color
		for (var i=0; i<8; i++) //check neibs
		{
			
			//checking whether dn  exists dots exists and we can make polyline with "3-depth" edges
			if (game.exist(x+neib[i*2],y+neib[i*2+1]) != null) 
			{
				var dn=game.exist(x+neib[i*2],y+neib[i*2+1]);
				
				if (game.checkline(d1,dn))
				{
					game.data(dn,{t:c.dotused,p:game.data(d1).id});
					var res = game.checkstep(dn,depth+1);
					game.data(dn,{t:c.dotfree,p:game.data(dn).id});
					if (res==2 && depth<2 || res>0 && depth==2)
					{
						
						var o = game.data(dn);
						_neib.push(dn);
						dn.color(c.colorp);
						game.triggers.up[o.id] = function () {
							for (var i=0; i<_neib.length; i++)
							{
								_neib[i].color('#000');
							}
							var 
								d2 = this,
								line = game.line(d1,d2,c.elem.line[p],c.elem.dot[p],c.colora,c.dotused,c.dotactive).level(c.layers.line).lineStyle({lineWidth:c.linew});
							game.triggers.up={};
							
							if (game.checkgoal(d2,p)[0])
							{
								cb0(d2);
								return null;
							}
							if (depth == 2) {
								cb0(d2);
								return null;
							}
							else
							{
								return wait(d2,depth+1);
							}
						}
					}
				}
			}
		}
	}
	
	return wait(dot,depth); // start from polyline with 0 edges
}
game.throw = function(dot,p,cb) { // make pass by air
		var c=game.const, data = game.data(dot), x=data.x, y=data.y, x0, y0,dn,_neib=[];
		for (var i=0; i<8; i++)
		{
			x0=x+(c.longt+1)*c.neib[2*i]; y0=y+c.neib[2*i+1]*(c.longt+1);
			var k = 0;
			while ((x0!=x || y0 !=y) && k < c.longt)
			{
				if (game.exist(x0-=c.neib[2*i],y0-=c.neib[2*i+1]) != null) dn = game.exist(x0,y0)
				else continue;
				//console.log(JSON.stringify(dn.data));
				if (game.data(dn).t == c.dotfree) //if only with c.longt edges
				{
					
					//dn.color('#0ff');
					//jc.start(idg);
					dn.color(c.colorp);
					game.triggers.up[game.o2n(dn)]=function(){
						for (var i=0; i<_neib.length; ++i)
						{
							var 
								e = _neib[i],
								d = game.data(e);
							delete(_neib[i]);
							e.color(c.colord);
							delete(game.triggers.up[d.id]);
						}
						var d2 = this;
						game.data(dot,{t:c.dotused});
						game.data(d2,{t:c.dotactive});
						d2.color(c.colord);
						cb(d2);
					}
					_neib.push(dn);
					break;
				}
				++k;
			}
		}
}

game.makestep = function(d,p,cb0) { // make step
	var c=game.const, cb = function(dot) {
		dot.color(c.colora);
		game.data(dot,{lp:p,ld:d});
		jc.start(idg);
		cb0(dot,p);
	}
	
	d.color(c.colorg[p]);
	switch (game.checkstep(d,0)) {
		case 2: console.log('start pass '+p); d2=game.pass(d,p,0,cb); console.log('end pass '+p); break;
		case 1: console.log('start throw '+p); d.color(c.colorg[p]); d2=game.throw(d,p,cb); console.log('end throw'+p); break;
		default: cb0(false);
	}
	return null;
}
game.reset = function() {
	jc.start(idg,true);
	jc.clear();
	//draw vert lines
	var c = game.const;
	for (var i=0; i<c.nvl; i++)
	{
		var color = c.colorv;
		//if (i==0 || i==c.nvl-1)
//			color = c.colorb;
		if (i==c.nvl-1)
			color = '#ce6ea1';
		
		var x=i*c.vind + c.lind;
		
		jc.line([[x,0],[x,c.height]],color).level(c.layers.back);
	}
	
	for (var i=0; i<c.nhl; i++)
	{
		var color = c.colorh;
//		if (i==0 || i==c.nhl-1)
			//color = c.colorb;
			
		
		var y=i*c.hind + c.tind;
		
		jc.line([[0,y],[c.width,y]],color).level(c.layers.back);
	}	
	
	//drawing dots
	jc.start(idg,true);	
	for (var i=0;i<c.nvl;++i)
	{
		var x=i*c.vind + c.lind;
		dots[i]=[];		
		for (var j=0; j<c.nhl;++j)
		{
			var y=j*c.hind + c.tind;
			//make add dot for good click // trash 
			
			dots[i][j]=jc.circle(x,y,c.rd,c.colord,1).level(c.layers.dot);
			jc.circle(x,y,c.addrd,c.colord,1).attr('alpha',0).mousemove(function(e){game.actions(game.data(this).dot,e,'move'); return false;})
				.mouseover(function(e){game.actions(game.data(this).dot,e,'over'); return false;})
				.mouseout(function(e){game.actions(game.data(this).dot,e,'out'); return false;})
				.mouseup(function(e){game.actions(game.data(this).dot,e,'up'); return false;})
				.mousedown(function(e){game.actions(game.data(this).dot,e,'down'); return false;}).level(c.layers.dot).data={dot:dots[i][j]};
			game.data(dots[i][j],{
					t:c.dotfree,
					x:i,
					y:j,
					p:i+','+j,
					id:i+','+j
				});
			
		}
		
	}
	
	var 
		n=c.nhl,
		m =Math.round((n-c.longg)/2),
		y1=m-1,
		y2=n-m,
		x1=0,
		x2=c.nvl-1,
		xl = dots[(c.nvl+1)/2-1][0]._x,
		d1=dots[x1][y1],
		d2=dots[x1][y2],
		d3=dots[x2][y1],
		d4=dots[x2][y2];
	
	game.const.cmline = jc.line([[xl,0],[xl,c.height]],c.colorml).level(c.layers.line).lineStyle({lineWidth:c.mlw}); //middle line
	game.const.lgate = game.line(d1,d2,c.colorg[0],game.color(d1),game.color(d2),c.dotfree,c.dotfree); // left gate
	game.const.rgate = game.line(d3,d4,c.colorg[1],game.color(d3),game.color(d4),c.dotfree,c.dotfree); // right gate
	game.const.gates = [game.const.lgate,game.const.rgate];
	game.data(c.lgate,{x1:x1,x2:x1,y1:y1,y2:y2});
	game.data(c.rgate,{x1:x2,x2:x2,y1:y1,y2:y2});
	c.lgate.lineStyle({lineWidth:c.widthg}).level(c.layers.gate);
	c.rgate.lineStyle({lineWidth:c.widthg}).level(c.layers.gate);
}
game.checkgoal = function(d,p) {
	var 
		c= game.const,
		g = [game.data(c.lgate),	game.data(c.rgate)],
		dod = game.data(d),
		x = dod.x
		y = dod.y,
		pi = p==1?0:1,
		res = null;
		if (x == g[pi].x1 && y>= g[pi].y1 && y<= g[pi].y2)
		{
			res =  [true,p]
		}
		if (x == g[p].x1 && y>= g[p].y1 && y<= g[p].y2)
		{
			res = [true,pi];
		}
		return res!=null?res:[false,null];
}
game.newgame = function(p,cb0) {
	var
		c = game.const,
		d = dots[(c.nvl+1)/2-1][(c.nhl-c.nhl%2)/2].color(c.colorg[p]);
		game.data(d,{t:c.dotused}),
		cb = function(dot,p){
			//console.log(JSON.stringify(dot.data),p);
			/*if (game.undo[0]>0)
			{
				var res;
				while (game.undo[0]>0)
				{
					res = game.undo[1](dot);
					dot=res[0];
					p=res[1];
				}
			}
			else
			{*/
				p= p==1?0:1;
			/*}*/
			
			if (dot==false) {
				cb0(-1);
			}
			else
			{
				var res = game.checkgoal(dot,p);
				if (res[0]) {
					setTimeout(function(){alert(c.name[res[1]]+' win!')},1);
					cb0(res[1]);
					return null;
				}
				
				
				
				if (game.checkstep(dot,0)==1 && game.data(dot).lp != undefined) 
					p=game.data(dot).lp;
				document.title='The step of '+c.name[p];
				if (c.tplayer[p]=='man')
					game.makestep(dot,p,cb)
				else 
					{/* document.title='Computer think';*/ 
						
						setTimeout(function(){
							game.makecompstep(dot,p,cb);
						},1)
					}
			}
		}
	document.title='The step of '+c.name[p]
	if (c.tplayer[p]=='man') 
	{
		game.makestep(d,p,cb)
	}
	else 
	{
		setTimeout(function(){
			game.makecompstep(d,p,cb);
		},1)
	}
}
game.init = function(p1,p2) {
	
	/*alert('Good day!');
	game.const.name[0]=prompt('Who are you?','Anonymous');
	if (!confirm('Do you want to play with me?'))
	{
		game.const.tplayer[1]='man';
		game.const.name[0]=prompt('And who are you ?','2nd');
	}*/
	
	var 
		p=0/*Math.round(Math.random()*1)*/,
		f = function(w) { 
			switch (w)
			{
				case 0: ++p1; break;
				case 1: ++p2; break;
				case -2: break;
				default: game.draw();
			}
			$('#score').html(p1+':'+p2);
			$('#game_field').click(function(){
				p = p==1?0:1;
				$(this).unbind('click');
				if (confirm('One more?')) {
					game.reset();
					game.newgame(p,f);
				}
				else
				{
					alert(p1+':'+p2);
					return null;
				}
		});
	}
	game.reset();
	game.triggers.over['all']=function(){console.log(JSON.stringify(game.data(this)));}
	game.newgame(p,f);
}
$(document).ready(function() {
	var flag=true;
	while ( flag)
	{
		var res=prompt('Enter the size of field','39,21').match(/\d+/gi);
		
		if (res!=null && res.length==2 )
		{
			var 
				x = parseInt(res[0].replace(/0+(\d.*)/gi,'$1')),
				y = parseInt(res[1].replace(/0+(\d.*)/gi,'$1'));
			if ((x & 1) ==1 && (y & 1) ==1 && y>=game.const.widthg && x>=5)	
			{
				game.const.nvl=x;
				game.const.nhl=y;
				flag=false;
			}
		}	
		
	}
	var 
		c = game.const;
	
	//set field
	$('#'+idg).attr('height',game.const.height);
	$('#'+idg).attr('width',game.const.width);
	game.const.vind=	Math.round((c.width-c.lind-c.rind)/(c.nvl))
	game.const.hind= Math.round((c.height-c.tind-c.bind)/(c.nhl))	
	$("#diff0,#diff1").slider({
		min:0,
		max:5,
		slide:function(event,ui){
			var p= this.id.replace(/.*(\d).*/gi,'$1');
			console.log('change 1');
			$(this).find('div').html(game.const.bname[ui.value]);
			if (ui.value==5)
			{
				game.const.tplayer[p]='man';
			}
			else
			{
				game.const.tplayer[p]='bot';
				game.const.bdiff[p]=ui.value;
			}
		}
	});
/*	$("#diff1").slider({
		min:0,
		max:5,
		change:function(event,ui){
			console.log('change 1');
			if (ui.value==5)
			{
				game.const.tplayer[1]='man';
			}
			else
			{
				game.const.tplayer[1]='bot';
				game.const.bdiff[1]=ui.value;
			}
		}
	});*/
	$('#name0').html(game.const.name[0]);
	$('#name1').html(game.const.name[1]);
	$('#name0,#name1').click(function(){
		var
		 name=this.innerHTML,
		 p	= this.id.replace(/.*(\d).*/gi,'$1');
		 var flag=true;
		while (flag)
		{
			var name0 = prompt('Ваше имя',name);
			if (name0!='' && name0!=null && name0.length<20) 
			{
				this.innerHTML=name0;
				game.const.name[p]=name0;
				flag=false;
			}
		}
	});
	$('#diff0').slider('value',5);
	$('#diff1').slider('value',5);
	$('#bname0').html(game.const.bname[game.const.bdiff[0]]);
	$('#bname1').html(game.const.bname[game.const.bdiff[1]]);
	/*$('#undo').click(function(){
		game.undo[0]++;
		this.value='Undo['+game.undo[0]+']';
	});*/
	game.reset();
	$(document.body).show();
	game.triggers.up={};
	$('#'+idg).click(function(){
		$(this).unbind('click');
		setTimeout(function(){
			jc.clear(idg);
			game.init(0,0);
		},1000);	
	});

});
