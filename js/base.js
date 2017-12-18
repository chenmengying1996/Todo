;(function(){
	'use strict';
	var $form_add_task=$('.add-task')
//	var new_task={};
	//把new_task推到localStorage里面，那么localStorage需要最大的容器，所以设置一个task_list
//	最开始是在这里定义的，虽然在谷歌里面不会报错，但是在ie里面就报错了，你先在input中输入一个新任务aaaaa,点击
//	submit他可以打印，然后你又在input里面输入了bbbbb,这时你会发现，你的之前输入的aaaaa也变成了bbbbb,也就
//	就是说，你现在有了两个bbbbb,被覆盖掉了，因为var new_task={};你定义的是全局变量，每一次你再输入的时候，新输入的
//  任务就会把之前的任务给覆盖掉
//  所以var new_task={};不该定义在这里
		,task_list=[]
	//注意这两个类名中间没有空格
	//注意：此时并不会获取到任何东西，因为这是动态添加，而文档的执行顺序是从上到下，而此时那些条目是动态的，之后才添加上的，在此时根本不存在，是执行到render_task_list()的时候才添加上，他无法获取到这个，所以我们在这里可以先只声明一个
	   ,$delete_task
	   ,$detail_task
	   //$detail_task 指的是右浮动的小字
	   ,$task_detail=$('.task-detail')
	   ,$task_detail_mask=$('.task-detail-mask')
	   ,current_index
	   ,$update_form
	   ,$task_detail_content
	   ,$task_detail_content_input
	   ,$checkbox_complete
	   ,$msg=$('.msg')
	   ,$msg_content=$msg.find('.msg-content')
	   ,$msg_confirm=$msg.find('.confirmed')
	   ,$player=$('.player')
	   ,$body=$('body')
	   ,$window=$(window)
	   ;
	//所以作者此时出现了bug,他是如何发现bug的原因的呢？首先在点击事件里面consloe('1',1);发现并没有反应，说明并没有获取到$delete_task，然后他干脆在这条语句下面consloe('1',1)，发现还是没有反应
	//此时他发现是文档运行顺序的原因
	//此句应该写在render_task_list()中，并且是在for循环结束后
	
	init();
	//添加task的原理是：每一次添加之后其实是在迭代我们得task_list,task_list在我们的localStorage里面存着呢，每次添加的时候，其实是添加到一个array中
	//然后再把这个array转化成一个json,然后再把json存到localStorage里面
	//删除task的原理是：点击删除，我们需要把每一条的index给他传进去，然后在array里面把index给删掉，然后更新localStorage
	//系统自带的alert()虽然很方便，但是，一旦他弹出来就会影响其他的内容的工作，所以我们自己封装一个，虽然麻烦，但是很灵活
	//可以传参r，也就是说用户点击的是什么，全部都存在r里面
	//my_alert('abc')这个函数返回的是promise的值，than里面的那个参数r来自于dfd.resolve(confirmed);
//	my_alert('确定要删除吗？').then(function(r){
////		console.log('r',r);
//		if(r){
//			delete_task();
//		}else{
//			....
//		}
//	})
	//这里都是测试，这个函数真正要放在delete_task()函数里面
	
	$form_add_task.on('click','button[type=submit]',function(e){
		//应该把它定义成局部变量，这样就不会出现被覆盖掉的现象了
		var new_task={};
		//禁用默认行为
		e.preventDefault();
		//find()查找指定元素的所有后代元素
		//注意：此时的this指的是button,所以input是他的兄弟元素，应该写siblings
		//获取input中新输入的新task的值
		//加了content是一个对象的形式输出
//		$input=$(this).siblings('input[name=content]');
		new_task.content=$(this).siblings('input[name=content]').val();
		//如果新task的值为空 则直接返回 否则继续执行
//		if(!new_task.content) return;
		
		//否则存入新task
		//直接把new_task传进来
		if(add_task(new_task)){
		//render:给，递交
//			render_task_list();	
			//这里的render_task_list();不需要的原因是在add_task(){}函数内包含了这个
			//val("")这句是说，添加了任务之后，把input输入框的内容为空
			$(this).siblings('input[name=content]').val('');
		}
		//console这一步是检验，是否能获取到input中新输入的新task的值
//		console.log('new_task',new_task);
		//检验这个函数有没有进来
//		alert(1);
		//检验add_task(new_task)和render_task_list()
	
//		console.log('new_task.content',new_task.content);
})
	//点击$task_detail_mask，隐藏$task_detail，隐藏$task_detail_mask
	//hide_task_detail，，这里只放函数名也代表函数体
	$task_detail_mask.on('click',hide_task_detail);
	
	//运用监听绑定是动态和静态的区别
	//查找并监听所有删除按钮的点击事件
	//构造一个监听方法去监听新的删除事件
	//因为jquery他不会自动去绑定这些数据和view的变化，所以需要我们手动的，每次变化之后，去手动的添加事件，把变化之后的内容，添加到事件的监控源中去
	function listen_task_delete(){
		//$delete_task指页面中所有的删除按钮
	$delete_task.on('click',function(){
		//var $this=$(this);把当前点击的元素变成了jquery object
		var $this=$(this);
		//找到删除按钮所在的task元素
		var $item=$this.parent().parent();
		//把被点击的那个index传给index
		var index=$item.data('index');
		//删除被点击的那个index
		//确认删除
//		var tmp=confirm('确定删除?');
//		tmp?delete_task(index):null;
		my_alert('确认删除？').then(function(r){
			r?delete_task(index):null;
		})
		//此时要被删除的那个任务还是存在
//		console.log('$item.data(index)',$item.data('index'));
	})
	}
	//监听打开task详情的事件
	//其实task_detail和task_delete是一样的思路
	function listen_task_detail(){
		var index;
		//此时双击task-item，就能把每一个task-item对应的详情页打开
		$('.task-item').on('dblclick',function(){
//			console.log('1',1);
			index=$(this).data('index');
			show_task_detail(index);
		})
		$detail_task.on('click',function(){
			//反正是局部变量，就算是重名了也没用关系
			var $this=$(this);
			var $item=$this.parent().parent();
			//index就等于data里面的index
			index=$item.data('index');
//			console.log('index',index);
			//此时我点击了页面上唯一一个任务的详情，但是他的index显示的是14，这是因为之前我们写了很多任务了，虽然删除了，但是index不会把他填补上，只会一直下一个，下一个，一直加
			//index 14
			show_task_detail(index);
		})
	}
	
	function listen_msg_event(){
		$msg_confirm.on('click',function(){
			hide_msg();//此时如果直接点击知道了没有反应，必须要在init()里面调用一下他
		})
	}
	//监听完成Task事件
	function listen_checkbox_complete(){
		$checkbox_complete.on('click',function(){
//			console.log('1',1);
//			console.log($(this).is(':checked'));//输出true或者false
			var $this=$(this);
			console.log('$this',$this);
//			var is_complete=$this.is(':checked');
//			console.log('is_complete',is_complete);//出了一个问题，点击checkbox打印true，再点击时还是打印了true
			//那我们先不管他打钩打叉的代码，看下数据
			//获取index的写法
			var index=$this.parent().parent().data('index');
			var item=get(index);
//			console.log('item',item);//item {content: "A", desc: "AAAAA", remind_date: "2017-12-23", complete: true}
			//传入索引和数据
			if(item.complete){
				//如果已经完成了，用户再点击说明要取消，所以是false
				update_task(index,{complete:false});
//				$checkbox_complete.css("background-color","#a8b6f7");
				//更新view
				//$this.prop('checked',true);使勾选框打钩
//				$this.prop('checked',true);//点击一次，输出 task_list[index] {content: "A", desc: "AAAAA", remind_date: "2017-12-23", complete: false}
				//最后实现不了更新view,也就是说实现不了，点击一次给勾选框打钩，但是我们发现，点击一次勾选框，他就refresh一次，所以我们可以在refresh里面给他更新
				//在这里我们只关心数据，更新模板这件事，我们交给refresh_task_list()里面的render_task_list()里面的render_task_item
			}else{
				update_task(index,{complete:true});
//				$this.prop('checked',false);//再点击一次，输出task_list[index] {content: "A", desc: "AAAAA", remind_date: "2017-12-23", complete: true}
				$checkbox_complete.css("background-color","#a8b6f7");
			}
//			
		})
	}
	
	function my_alert(arg){
		if(!arg){
			console.error('my_alert is required');
		}
		var conf={}, 
			$box,
			$mask,
			$title,
			$content,
			$confirm,
			$cancle,
			dfd,
			confirmed,
			timer
			;
		//简单说，deferred对象就是jQuery的回调函数解决方案。在英语中，defer的意思是"延迟"，所以deferred对象的含义就是"延迟"到未来某个点再执行。
		//jQuery规定，deferred对象有三种执行状态----未完成，已完成和已失败。如果执行状态是"已完成"（resolved）,deferred对象立刻调用done()方法指定的回调函数；如果执行状态是"已失败"，调用fail()方法指定的回调函数；如果执行状态是"未完成"，则继续等待，或者调用progress()方法指定的回调函数（jQuery1.7版本添加）
		dfd=$.Deferred();
//		dfd.resolve();

		if(typeof arg=='string')
			conf.title=arg;
		else{
			//用arg来extend conf
			conf=$.extend(conf,arg);
		}
		//console.log('conf',conf);
		$box=$('<div>'+
		'<div class="alert-title">'+conf.title+'</div>'+
		'<div class="alert-content">'+
		'<div><button class="primary confirm" style="margin-right:5px">确定</button>'+
		'<button class="cancle">取消</button></div>'+
		'</div>'+
		'</div>');
		//注意box和mask都要给position:fixed定位   'box-shadow':'0 1px 2px rgba()' 0:阴影水平方向位移  1px:阴影竖直方向位移  2px:阴影扩散半径  还有一个参数没有写是阴影面积  
		$box.css({position:'fixed',width:300,height:'auto',background:'#fff','border-radius':3,'box-shadow':'0 1px 2px rgba(0,0,0,.3)',color:'#333',padding:'15px 10px'});
		
		$title=$box.find('.alert-title').css({padding:'10px','font-weight':900,'font-size':20,'text-align':'center'});
		$content=$box.find('.alert-content').css({padding:'10px','text-align':'center'});
		//$content.find('button.confirm') 找有一个类名叫confirm的button按钮
		$confirm=$content.find('button.confirm');
		$cancle=$content.find('button.cancle');
		
		$mask=$('<div></div>');
		//这样定位mask能把父盒子遮住
		$mask.css({position:'fixed',background:'rgba(0,0,0,.5)',top:0,bottom:0,left:0,right:0});
		
		//每隔50s检查confirm
		timer=setInterval(function(){
			if(confirmed !==undefined){
				dfd.resolve(confirmed);
				//如果这个if函数执行了。说明用户点击了，那么我们已经知道结果了，就不用判断了,清除定时器
				clearInterval(timer);
				//当用户点击之后，弹出框消失
				dismiss_alert();
			}
		},50);
		
		//异步：具体用户什么时候会点击我们根本不知道
		$confirm.on('click',function(){
//			console.log('confirmed',confirmed);//undefined 也就是说，如果没有点击这一步的话confirmed的值一直是undefined,点击了之后就变成了true
			confirmed=true;
		})
		
		$cancle.on('click',function(){
			confirmed=false;
			//点击取消之后再点确定是没有用的，因为定时器已经清除了，
		})
		
		$mask.on('click',function(){
			confirmed=false;
		})
		function dismiss_alert(){
			//因为之前是用的appendTo(),所以想着这里用remove()比较合适
			$mask.remove();
			$box.remove();
		}
		function adjust_box_position(){
			var window_width=$window.width(),
				window_height=$window.height(),
				box_width=$box.width(),
				box_height=$box.height(),
				move_x,
				move_y;
				
				move_x=(window_width-box_width)/2;
				move_y=(window_height-box_height)/2-80;
				
				$box.css({left:move_x,top:move_y});//此时有一个弊端：缩放窗口并没有用
				
//			console.log('$window.width()',$window.width());//1352
//			console.log('$window.height()',$window.height());//620
//			console.log('$box.width()',$box.width());//300
//			console.log('$box.width()',$box.height());//200
		}
		
		//当窗口缩放时
			$window.on('resize',adjust_box_position);//但是这样更不合理，因为这样写虽然当窗口缩放时是可以居中的，但是，刷新网页时，他不是居中的
//		adjust_box_position();
		
		
		//注意这里box在mask的后面，这样可以避免层级问题，尽量能不要z-index就不用z-index
		$mask.appendTo($body);
		$box.appendTo($body);
		
		//这样就解决了刷新窗口时不居中的问题
		$window.resize();
		return dfd.promise();
	}
	
	function get(index){
		return store.get('task_list')[index];
	}
	//查看task详情
	//点击详细，$task_detail,$task_detail_mask出现
	function show_task_detail(index){
		//生成详情模板
		render_task_detail(index);
		current_index=index;
		//显示详情模板（默认隐藏）
		$task_detail.show();
		//显示详情模板mask（默认隐藏）
		$task_detail_mask.show();
		//此时显示出来之后你会发现，无论你点哪一条任务的详细，都会跳出来，你之前设置的那条，说明此时你得传进来一个index,他才有对应的那个详细的显示
		//对应5-2任务详情（2）
		
	}
	//更新task
	function update_task(index,data){
		//如果index这条数据存在才是有意义的，不存在就没有任何意义
		if(!index||!task_list[index]) return;
//		task_list[index]=deta;
		//更保险的方法
		//jquery.merge()是merge数组的，不是merge对象的
		//jQuery.extend() 函数用于将一个或多个对象的内容合并到目标对象。
		//第一个数据给一个空的对象，第二个数据给一个以前的数据，第三个数据给data(新数据),合并之后的一个结果
//		task_list[index]=$.extend({},task_list[index],data);
//		task_list[index]=data;//到checkbox这一步是data为{complete:is_complete}，{complete:true||false}他会把之前的data都替换掉，这是不可以的，那么之前做的都白费了，所以还是要用merge方法
		task_list[index]=$.extend({},task_list[index],data);//此时点击checkbox数据清空
		//因为之前点击详情，但是在文本框里面输入数字，点击更新之后，任务的名字变成了undefined
		//我们检查一下到底更新没有
		//打印当前条
//		console.log('task_list[index]',task_list[index]);//{length: undefined}
                                                         //length:undefined __proto__:Object
		//此时测试console.log时出现bug,那么我们先不merge它，直接把data传进去，因为我们得data本来就能把之前的数据显示出来
//      console.log('store.get(task_list)',store.get('task_list'));
		refresh_task_list();
		console.log('task_list[index]',task_list[index]);//task_list[index] {content: "A", desc: "AAAAA", remind_date: "2017-12-23", complete: true}
	}
	
	//隐藏task详情
	function hide_task_detail(){
		$task_detail.hide();
		$task_detail_mask.hide();
	}
	
	//渲染指定task的详细信息
	//类似于render_task_item
	//需要传入index的原因是，如果不传的话，那么点击其他的任务的详细项，也会一直出现之前出现过的那一条任务详细
	//无法根据任务的不同改变内容详细
	function render_task_detail(index){
		if(index===undefined || !task_list[index]) return;
		//这里的index如果弄不清楚可以参考下面的render_task_item()
		var item=task_list[index];
//		console.log('item',item);
		//检测item到底有没有
		//console.log('item',item);//item {content: "aaaaa"}
		//这里之前是div,改成form的原因是：希望双击content的时候，能出现一个input输入框，能做到通过input修改content
		var tpl='<form>'+
					'<div class="content">'+//<!--任务标题开始-->
						item.content+
					'</div>'+//<!--任务标题结束-->
					//<!--任务描述开始-->
						'<div class="input-item">'+
						    '<input style="display:none" type="text" name="content" value="'+(item.content||'')+'">'+
						'</div>'+
						'<div>'+
						'<div class="desc input-item">'+
						//有一个bug就是每次新增加一个任务，然后点击详细，他的文本框会出现undefined
							'<textarea name="desc">'+(item.desc||'')+'</textarea>'+
							//可以让内容更新之后直接显示在文本框
						'</div>'+
						'</div>'+
					//<!--任务描述结束-->
					    '<div class="remind input-item">'+//<!--任务定时提醒开始-->
					    	'<label>提醒时间</lable>'+
					    	//因为input type="time"无法做到获取准确时间，所以引入一个插件
						    '<input id="datetimepicker"type="text" name="remind_date" value="'+(item.remind_date||'')+'"/>'+
						    //item.remind_date参考下面的data.remind_date
						//<!--用户输入日期的时候button才出来-->
						//<!--<button type="submit">submit</button>-->
					    '</div>'+//<!--任务定时提醒结束-->
						'<div class="input-item"><button type="submit">更新</button></div>'+
				'</form>';
		//先把他的内容全部清空
		//先清空Task详情模板
		$task_detail.html(null);
		//用新模板替换旧模板
		$task_detail.html(tpl);
		$('#datetimepicker').datetimepicker({lang:'ch'});
		//选中其中的form元素，因为之后会使用他监听submit事件
		$update_form=$task_detail.find('form');
		//选中显示Task内容元素
		$task_detail_content=$update_form.find('.content');
		//选中显示Task的input的元素
		$task_detail_content_input=$update_form.find('[name=content]');
		//用console.log来检验$update_form有没有被绑定到
//		console.log('$update_form',$update_form);
		console.log('$task_detail_content',$task_detail_content);//能够打印出来，说明此时变量设置并没有问题
		//如果双击class='content'这个元素，那么隐藏的input框出现
		$task_detail_content.on('dblclick',function(){
//			console.log('1',1);//此时双击，发现1并没有打印出来，那么我们在外面看能不能把$task_detail_content打印出来
			$task_detail_content_input.show();
			$task_detail_content.hide();//此时双击之后就变成了一个input
		})
		$update_form.on('submit',function(e){
			e.preventDefault();
			var data={};
			//获取表单中各个input的值
			data.content=$(this).find('[name=content]').val();
			data.desc=$(this).find('[name=desc]').val();
			data.remind_date=$(this).find('[name=remind_date]').val();
			//先测试
//			console.log('1',1);//此时有一个非常短暂的1出现是因为当前页重新刷新了，我们要e.preverntdefault,不然这个表单就提交了,点击submit表单立刻提交是默认行为，我们要阻止，所以需要e.preventDefalut()
			//我们先不让他更新，我们把data打印一下
//			console.log('data',data);//{content: undefined, desc: "asdfcfe", remind_date: ""}
                                       //content:undefined desc:"asdfcfe" remind_date:""__proto__:Object
           //把数据写到localStorage里面
            update_task(index,data);
            //填完了详细项，点击更新，然后隐藏详细框
            hide_task_detail();
            //此时点击更新，详细框隐藏了，然后再点击详细发现日期那里有点问题，无法显示之前选择的时间
          	})
	}
	function add_task(new_task){
		//把新任务推到task_list的这个大盒子里，task_list是作为localStorage的
		//先更新task_list,再放入localStorage中
//		console.log(task_list);
		task_list.push(new_task);//添加了详细之后的new_task是new_task={content:'a'}
		//push了之后task_list还在task_list里面，并不在localStorage里面
		//更新localStorage,专门写了个方法
//		store.set('task_list',task_list);
		refresh_task_list();
		return true;
//		console.log('task_list',task_list);
		//task_list [{…}]0: content: "aaaaa"__proto__: Objectlength: 1__proto__: Array(0)
	}
	
	//刷新localStorage数据，并渲染模板
	//每一次task_list变了之后，更新localStorage
	function refresh_task_list(){
		store.set('task_list',task_list);
		//render_task_list();生成模板item
		render_task_list();
	}
	
	//删除一条task
	function delete_task(index){
		//如果没有index,直接就return
		//或者在task_list里面也不存在这个index
		//会有index===0的情况，需要考虑
		if(index===undefined || !task_list[index]) return;
		delete task_list[index];
		//删除了某项任务也要更新task_list
		//console.log()是做检测，这是点击发现没有任何东西输出，说明delete_task是有问题的
		console.log('task_list',task_list);
		refresh_task_list();
	}
	
	function init(){
//		store.clear();
		//task_list为全局变量，可以在函数体内使用
		//store.get()和localStorage一样用
		//如果没有||[]，会报错，说push为空，因为先执行的init,此时的localStorage里面确实没有数据，那么此时task_list就取值为空数组，然后根据代码执行顺序，在获取新的input里面的值给空数组，此时他就有数据了，就能够输出了
//		window.localStorage.removeItem('task_list');
		task_list=store.get('task_list')||[];
		//有了这个if判断，他之前的任务也会显示，如果没有的话，他之前的任务就不显示
		if(task_list.length)
		   render_task_list();
//		 console.log('store.get(task_list)',store.get('task_list')); 
		task_remind_check();//在一开始的时候就检查是不是有新的需要提醒的内容，如果有的话，我们就要提醒
		listen_msg_event();
	}
	
	function task_remind_check(){
//		show_msg('lallalala');//这时能显示出来，说明这个show函数没有问题是下面出了问题
		var current_timestamp;//先声明
		//只要网页开着，这个task_remind_check()就要一直执行，所以给一个setInterval
		var itl=setInterval(function(){
			for(var i=0;i<task_list.length;i++){
			var item=get(i), task_timestamp;
//			console.log('item',item);
			//如果没有item或者item里面没有remind_date，就跳出本次循环，进行下一次循环
			if(!item||!item.remind_date||item.informed)//参考前面的render_task_list()函数
				continue;
			//new Date()当前的时间生成的一个Date对象
			current_timestamp=(new Date()).getTime();
			task_timestamp=(new Date(item.remind_date)).getTime();
//			console.log('current_timestamp',current_timestamp);
//			console.log('task_timestamp',task_timestamp);
			if(current_timestamp-task_timestamp>=1){
				update_task(i, {informed: true});
				show_msg(item.content);
			}
		}
		},300);
		
	}
	
	function show_msg(msg){
		//如果没有msg直接return
		if(!msg) return;
//		console.log('1',1);
		$msg_content.html(msg);
		//$player.get(0)返回的是html的node属性
		$player.get(0).play();
		$msg.show();
	}
	function hide_msg(){
//		console.log('1',1);
		$msg.hide();
	}
	//渲染全部的task模板
	function render_task_list(){
		//这个函数的作用是：把数据给task_list
		//检验函数有没有进来，
//		console.log('1',1);
		//控制台输出了1,说明已经更新模板了
		//这里的$task_list是一个新定义的jquery变量
		var $task_list=$('.task-list');
		//此时会有一个bug,在input中输入新任务，点击submit之后，之前存在localStorage中的数据也会出现，并且生成新的task_item
		//将之前的清空
		//解决了这个bug
		$task_list.html('');
		//task_list初始化之后本来就是一个数组
		//存在了localStorage里面
		var complete_items=[];
		for(var i=0;i<task_list.length;i++){
			var item=task_list[i];
			//当任务前面的勾选框勾选了的时候
			if(item && item.complete)
//				complete_items.push(item);//此时点击一个任务前面的勾选框，这个任务就好像被删除了一样，看不见了，这是因为他只会render没有被勾选的任务，被勾选了的任务，就放到了临时的complete_items的空数组里面
				complete_items[i]=item;
			else
			//因为这个render_task_tpl()函数本来返回的就是jquery变量，然后现在重命名为$task变量也是可以的
			//穿进来的数据就是task_list[i]
			var $task=render_task_item(item,i);
			//$task_list.append($task);这一步才是真正意义上的把数据加到task_list里面了
			$task_list.prepend($task);//这里用prepend不用append的原因是要把最后添加的放在最上面
			//此时会有一个bug,在input中输入新任务，点击submit之后，之前存在localStorage中的数据也会出现，并且生成新的task_item
		}
		
//		console.log('complete_items',complete_items);//complete_items Array(0)
		//渲染放了勾选框被勾选了的任务的临时数组
		for(var j=0;j<complete_items.length;j++){
			//var $task=render_task_item(complete_items[j],j);应该动态的跟着j来变化
			var $task=render_task_item(complete_items[j],j);
//			console.log('item',item);
			//完成的内容都到最后了，此时会有bug,就是所有的内容都变成了A,然后点击详细里面也是空的
			//$task代表已经完成了的内容，也就是勾选框打钩了的内容
			if(!$task) continue;//不执行 循环体内continue 后面的语句，直接进行下一循环
			$task.addClass('completed');
			$task_list.append($task);
		}
		
		//在jquery中动态添加元素，添加一个就要手动设置一个监听事件
		$delete_task=$('.anchor.delete');
		$detail_task=$('.anchor.detail');
//		console.log('$delete_task',$delete_task);
		$checkbox_complete=$('.task-list .complete[type=checkbox]')
		//每次新渲染一个任务就监听一次
		listen_task_delete();
		listen_task_detail();
		listen_checkbox_complete();
		//本来想将这两个监听放在init里面的，结果init()函数里面有render_task_list()这个函数
		//所以直接把监听函数写在这个里面也是一样的
	}
	
	//只渲染单条task模板
	function render_task_item(data,index){
		//如果没有data或者没有index这两个中的任何一个直接return
		//此时依然有bug:删了一个之后，后面再点击也没用了
		if(!data || !index) return;
		//这个函数的作用是：把数据给task_item
		//定义一个任务模板
		//这里面的index在前端看的时候就是0,1,2,3,4,5这样依次相加的索引了，是因为在上面的渲染多条的时候的for循环起了作用
		//此时的index起到了定位了作用，根据index,来判断删除的是哪一条
	var list_item_tpl='<div class="task-item" data-index="'+ index +'">'+//<!--任务开始-->
					//<!--要让内容保持在一行，所以用span-->
					//如果在里面加上一个checked那么刷新页面所有的勾选框都被选定了
					//(data.complete?'checked':'')这行代码的意思是：如果data里面有complete就为checked,如果没有就为空字符串
					  '<span><input type="checkbox" ' + (data.complete?'checked':'') + ' class="complete"></span>'+
					  '<span class="task-content">'+data.content+'</span>'+
					  '<span class="fr">'+
					  '<span class="anchor delete">删除</span>'+
					  '<span class="anchor detail">详细</span>'+
					  '</span>'+
					  '</div>';//<!--任务结束-->
					  //anchor:锚链接
	//类似于输入到input中的字符串通过这个函数加工成需要的task_item的模板的样式，然后返回jquery类型的变量return $(list_item_tpl);
	return $(list_item_tpl);
	}
})();