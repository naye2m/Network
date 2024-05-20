"use strict";
// todos // 
/* 
todo remove extra white spaces in html



*/

// document.addEventListener("click", e => {
// 	e.preventDefault();

// 	e.stopPropagation();
// 	return false
// })
// document.addEventListener("submit", e => {
// 	e.preventDefault();
// 	e.stopPropagation();
// })
// document.addEventListener("scrollend",log)


document.addEventListener('DOMContentLoaded', function () {
	// Use buttons to toggle between views
	// $('#inbox').addEventListener('click', () => load_mailbox('inbox'));
	// $('#sent').addEventListener('click', () => load_mailbox('sent'));
	// $('#archived').addEventListener('click', () => load_mailbox('archive'));
	// $('#compose').addEventListener('click', e => compose_email());
	// By default, load the inbox
	//?? load_mailbox('inbox');
	// $("#compose-view form").addEventListener("submit", e => {
	// 	e.preventDefault()
	// 	sentMail(...(["recipients", "subject", "body"]
	// 	.map(e => $('#compose-' + e).value)))
	// 	// Event.
	// })
	// var view = $("#view")
	let url_params = new URLSearchParams(window.location.search);

	// ? load the page on url
	// page = url_params.get("page")
	let page, url;
	url = url_params.get("url") || "posts"
	page = - -(url_params.get("page") || 1)
	loadViewPage(url, page);



});

function log(...log) {
	logs.appendChild(myDOMparse("<li>" + JSON.stringify(log) + "</li>")[0]);
	console.log(...log)
}

// views = ["all-post","add-post","edit-post","profile","follower-post"]
var views = [...view.children]

function loadView(element) {
	if (typeof element == "string")
		element = views.filter(e => e.id.includes(element))[0]
	if (!views.includes(element))
		return
	views.forEach(e => e.hidden = true)
	element.hidden = false

	// function loadView(viewname){
	// 	if(!views.includes(viewname))
	// 		return 
	// 	views.forEach(e => $(e+"-view").hidden = true)
	// 	$(viewname+"-view").hidden = false

}

function loadeditPost(elem) {
	let cap = [...elem.children].filter(e => e.classList.contains("caption"))[0]
	let pid = elem.dataset["pid"]
	editPost((cap ? cap.innerText : ""), pid ?? -1)
}

function editPost(caption, id) {
	loadViewPage("edit", "", { caption: caption, id: id })
}

function replacequery(key, value) {
	let sp = new URLSearchParams(window.location.search)
	sp.set(key, value)
	history.replaceState(null, null, "?" + sp)

}
async function getPage(pageNo, url) {
	// todo add url partern match

	if (!(pageNo && url))
		return [false, "[Not submited : 403] Error: Wrong usage."]
	let pageDat = await fetch(`/${url}?page=${pageNo}`)
	if (!pageDat.ok)
		return [false, `[${pageDat.status}] Error: ${pageDat.statusText}.`]
	return [true, await pageDat.json()]
}

function commentpost(form) {
	loginRequired(function () {
		let comment, tmp, pid, submitbtn;

		({ comment, "lastElementChild": submitbtn, "parentElement": { "dataset": { "pid": tmp } }, pid = Number(tmp) } = form)


		log(pid, comment);
		if (!comment.value)
			return log("empty comment")
		comment.hidden = true
		submitbtn.disabled = true
		submitbtn.value = "... submiting"

		fetch("/post/" + Number(pid).toString(), { method: "PUT", body: JSON.stringify({ comment: comment.value }) })
			.then(e => e.json())
			.then(e => {
				let postElem = form.parentElement;
				let commentsViwer = [...postElem.childNodes].filter(e => e.classList && e.classList.contains("comments"))[0];
				if (!commentsViwer.dataset["noOfComments"])
					commentsViwer.replaceWith(getPostTags().getCommentElem([
						{
							id: null, username: CU.username, comment: comment
						}
					]))
				else
					commentsViwer.replaceChildren(getPostTags().singleCommentElem({ id: null, username: CU.username, comment: comment.value }), ...[...commentsViwer.children].slice(0, 4))

			})
			.then(console.info)
			.catch(console.error)
			.finally(() => {
				submitbtn.value = "submit";
				comment.value = "";
				comment.hidden = false;
				submitbtn.disabled = false;

			})
	})


}
// function newPost(caption) {
// 	log(caption)
// }
function likePost(pid, elem) {

	loginRequired(function () {
		let islike = elem.classList.toggle("liked")
		elem.innerText = Number(elem.innerText) + (islike ? 1 : -1);
		// log(pid, islike);
		fetch("/post/" + Number(pid).toString(), { method: "PUT", body: JSON.stringify({ like: islike }) })
			.then(e => e.json())
			.then(console.info)
			.catch(err => { console.error(err); elem.innerText = Number(elem.innerText) + (!islike ? 1 : -1); elem.classList.toggle("liked") })
	})
}
/* function dislikePost(pid) {
	log(pid);
}
 */
function view_post(pid) {
	log(pid);
}
function followUser(username, elem, event) {
	let isFollow = elem.classList.toggle("following")
	let counter = [...elem.parentNode.children].filter(e => e.classList.contains("noOfFollowers"))[0]
	counter.innerText = (isFollow ? 1 : -1) + + counter.innerText;
	fetch('/user/' + username, { method: 'PUT', body: JSON.stringify({ "isFollow": isFollow }) })
		.then(res => res.json())
		.then(e => {
			return e;
		})
		.then(console.info)
		.catch(err => {
			console.error(err);
			elem.classList.toggle("following");
			counter.innerText = (!isFollow ? 1 : -1) + + counter.innerText;
		})
}
function loadFollowingPage(pageDat,url){
	let postsDat = pageDat[1];
	let elems = getPostTags(postsDat, url);
	all_posts_view.innerHTML = "";
	// url = "posts"
	// log(elems,pageDat,url)
	(
		[
			...mapElemsPosts(elems)
		]
			.map(e => all_posts_view.appendChild(e))
	)
	loadView("all_posts")
	replacequery("page", postsDat.pageNo)
	return
}

async function loadViewPage(url, pageNo = 1, kwargs = {}) {
	kwargs ??= {};
	replacequery("url", url)
	if (url.includes("edit") || (url.includes("new") && url.includes("post"))) {
		return loadNewPostView(kwargs)
	}
	if (url == "followingPosts") {
		kwargs["tmpcloneFollowerPage"] = [url, pageNo];
		[url,pageNo] = [ "posts",kwargs["tmpcloneFollowerPage"][1]+"&followers"]
	}
	let pageDat = await getPage(pageNo, url)
	if (!pageDat[0]) {
		loadView("err");
		return err_dat.innerText = pageDat[1]
	}
	if (kwargs["tmpcloneFollowerPage"] && pageNo == kwargs["tmpcloneFollowerPage"][1]+"&followers") {
		[url, pageNo] = kwargs["tmpcloneFollowerPage"];
		return loadFollowingPage(pageDat, url);
	}
	console.log(pageDat);
	// replacequery("url", url)
	if (url == "posts")
		return loadAllViewPage(pageDat, url);
	if (url.startsWith("user/"))
		return loadUserPage(pageDat, url);
	// all_posts_view.innerHTML = htmlText
}
function mapElemsPosts(elems) {

	return elems.notBlank ? [
		...myDOMparse(`<h2>Posts</h2><h3>${elems.pageInfo}</h3>`),
		elems.navigator,
		...elems.posts,
		elems.navigator.cloneNode(true)
	] : [...myDOMparse("<p>No posts to show</p>")];
}
// loadNewPostView({"caption":"hi"})
function loadNewPostView({ caption = "", id = null }) {

	// let postsDat = pageDat[1];
	// let elems = getPostTags(postsDat, url);
	let form = myDOMparse('<form><input class="hide" type="text" name="pid" value="' + (id ?? -1) + '" hidden><textarea name="caption" cols="30" rows="10">' + caption + '</textarea> <input type="submit" value="' + (id ? "Confirm Edits" : "Add New Post") + '"></form>')[0]
	form.addEventListener("submit", e => {
		e.preventDefault()
		console.log(e)
		let { pid, caption, ...rest } = e.target.children;
		({ pid, caption } = Object.fromEntries([pid, caption].map(e => [e.name, e.value])))
		pid ??= -1;
		e.target.children["pid"].value = ""
		e.target.children["caption"].value = ""
		fetch("post/" + pid, {
			headers: {
				"content-type": "application/x-www-form-urlencoded;charset=UTF-8",
			},
			method: "POST",
			// body: JSON.stringify({ "caption": caption }),
			// body: new URLSearchParams({ "caption": caption }),
			body: "caption=" + encodeURIComponent(caption),
		})
			.then(res => res.json())
			.then(res => {
				loadViewPage("posts")
				log(res)
				return res
			})
			.catch(err => {
				e.target.children["pid"].value = pid
				e.target.children["caption"].value = caption
				console.error(err)
				return
			})
			.finally(log("Posting Data Finished."))

		console.log(pid, caption)
		console.log(e)
	})
	new_post_view.innerHTML = "";
	// url = "posts"
	// log(elems,pageDat,url)
	new_post_view.appendChild(form)
	loadView(new_post_view)
	replacequery("page", "")

	// let htmlText = `<h2>Posts</h2>
	// <h3>${elems.pageInfo}</h3>
	// ${elems.navigator}`
	return
}
function loadAllViewPage(pageDat, url) {

	let postsDat = pageDat[1];
	let elems = getPostTags(postsDat, url);
	all_posts_view.innerHTML = "";
	// url = "posts"
	// log(elems,pageDat,url)
	(
		[
			...mapElemsPosts(elems)
		]
			.map(e => all_posts_view.appendChild(e))
	)
	loadView("all_posts")
	replacequery("page", postsDat.pageNo)

	// let htmlText = `<h2>Posts</h2>
	// <h3>${elems.pageInfo}</h3>
	// ${elems.navigator}`
	return
}
function loadUserPage(pageDat, url) {
	let response = pageDat[1];
	// console.log(pageDat)
	let postsDat = response["posts"];
	let userDat = response["user"];
	let elems = getPostTags(postsDat, url);
	let userDiv = getUserTag(userDat)
	profile_view.innerHTML = "";
	// url = "posts"
	(
		[
			userDiv,
			...mapElemsPosts(elems)
		]
			.map(e => profile_view.appendChild(e))
	)
	loadView("profile")
	replacequery("page", postsDat.pageNo)

	// let htmlText = `<h2>Posts</h2>
	// <h3>${elems.pageInfo}</h3>
	// ${elems.navigator}`
	return
}


function getUserTag(userDat) {
	return myDOMparse(
		`<div class="userinfo" data-username="${userDat.username}">
			<div class="name">
				<span class="full_name">${userDat.full_name}</span>
				<span class="username"> @${userDat.username}</span>
			</div>
			<div class="email">${userDat.email}</div>
			<div class="userinfos">
						<span class="is_active ${userDat.is_active ? 'show' : 'hidden'}" color="green">active</span>
				<span class="is_anonymous ${userDat.is_anonymous ? 'show' : 'hidden'}">anonymous</span>
				<span class="is_authenticated ${userDat.is_authenticated ? 'show' : 'hidden'}">authenticated</span>
				<span class="is_staff ${userDat.is_staff ? 'show' : 'hidden'}">staff</span>
				<span class="is_superuser ${userDat.is_superuser ? 'show' : 'hidden'}">superuser</span>
			</div>
			<div class="followerinfo">
			${!userDat.isCU && CU[0] ? '<button class="followBtn ' + (!userDat.isCUfollows ? 'following' : '') + '" onclick="event.stopPropagation();followUser(\'' + userDat.username + '\',this,event)"></button>' : (!CU[0] ? '<p class="info">Log in to follow this User</p>' : "")}
				<span class="noOfFollowers">${userDat.noOfFollowers}</span>&nbsp;&nbsp;&nbsp;&nbsp;
				<span class="noOfFollowing">${userDat.noOfFollowing}</span>
			</div>
			<div class="last_login date">${userDat.last_login}</div>
			<div class="date_joined date">${userDat.date_joined}</div>
		</div>`
	)[0]
}









function getPostTags(postsDat, pageurl) {
	function getUserTag(username) {
		return `<a class="usertag" onclick="event.stopPropagation();loadViewPage('user/${username}')">${username}</a>`;
		// return `<a class="usertag" onclick="event.stopPropagation();" href="#/user/${username}">${username}</a>`;
	}
	function singleCommentElem(comment) {
		let comTag = document.createElement("li")
		comTag.id = "comment" + comment.id;
		comTag.classList.add("comment");
		comTag.innerHTML = `${getUserTag(comment.username)} : ${comment.comment}`
		// log(comTag);
		return comTag
	}
	function getCommentElem(comments, post_id) {
		let commentsTag = document.createElement("ul");
		commentsTag.id = "comments" + post_id;
		commentsTag.classList.add("comments");
		commentsTag.dataset["noOfComments"] = comments.length;

		if (!comments.length) {
			// commentsTag = document.createElement("p");
			// commentsTag.id = "comments" + post_id;
			// commentsTag.classList.add("comments");
			commentsTag.innerText = "No comments yet.";
		} else {
			commentsTag.append(...comments.map(singleCommentElem));
			// log(commentsTag.outerHTML)
		}
		let form = myDOMparse(CU.is_authenticated ? `<form data-pid="${post_id}" class="authOnly" onsubmit="event.preventDefault();commentpost(this)"><input type="text" name="comment" placeholder="comment"><input type="submit" value="comment"></form>` : `<form data-pid="${post_id}" onsubmit="event.preventDefault();"><input type="text" name="comment" placeholder="Login to comment this post." disabled="disabled"></form>`)[0]
		return [form, commentsTag];
		// return `<form data-pid="${post_id}" class="authOnly" onsubmit="event.preventDefault();commentpost(this)"><input type="text" name="comment" placeholder="comment"><input type="submit" value="comment"></form><br/>` + (comments[0] ? `<p>Comments</p><ul id="comments${post_id}" class="comments">${comments.map(comment => singleCommentElem(comment)).join("")}</ul>` : "<p class='comments'>No comments yet</p>");
	}
	function getPostDiv(post) {
		let postElem = document.createElement("div")
		postElem.id = "post" + post.id
		postElem.classList.add("post")
		postElem.dataset["pid"] = post.id;
		postElem.addEventListener("click", log)
		// postElem.onclick(view_post(this.dataset.pid);)
		postElem.innerHTML = `<h3 class="user">${getUserTag(post.user)}</h3>
		<div class="time">${post.timestamp}</div>
		<span class="caption">${post.caption}</span>
		${post.postedByCU ? `<button class="solid editbtn" onclick="event.stopPropagation();loadeditPost(this.parentElement,${post.pid})">📝Edit</button>` : ''}
		<span class="likes${post.likesCU ? ' liked' : ''}" onclick="event.cancelBubble = true;likePost(this.parentElement.dataset.pid,this);">${post.likes}</span>`
		postElem.append(...getCommentElem(post.comments, post.id))


		return postElem;
	}
	if (!(postsDat && pageurl))
		return {
			"getUserTag": getUserTag,
			"getCommentElem": getCommentElem,
			"getPostDiv": getPostDiv,
			"singleCommentElem": singleCommentElem,
		}
	return postsDat.posts.length ?
		{
			notBlank: true,
			navigator: myDOMparse(`<div><button class="solid navigator p" ${postsDat.previousPage ? ('onclick="loadViewPage(\'' + pageurl + '\',' + postsDat.previousPage + ')"') : 'disabled="disabled"'}>&lt;</button><button class="solid navigator n" ${postsDat.nextPage ? 'onclick="loadViewPage(\'' + pageurl + '\',' + postsDat.nextPage + ')"' : 'disabled="disabled"'}>&gt;</button></div>`)[0],
			posts: postsDat.posts.map(getPostDiv),
			// posts: postsDat.posts.map(post => getPostDiv(post)).join(""),
			pageInfo: `Page ${postsDat.pageNo} of ${postsDat.last}`,
		} : {
			notBlank: false
		};
}

function loginRequired(func) {
	if (!CU[0]) {
		alert("Login required for this action.");
		console.warn(
			"login require for ", func
		);
		if (confirm("redirect to login page."))
			window.location.replace("/login");
		return null;
	}
	return func()
}


function myDOMparse(htmlText) {
	return new DOMParser().parseFromString(htmlText, "text/html").body.children
}











/* 


// reply functionality
// $("#email-view > button.reply").addEventListener("click", )
function replymail(e) {
	// event.preventDefault();
	// e = event.srcElement;
	//log("dhfj", e);
	let { to, sub, body } = {
		to: $('#email-view .from').innerText,
		sub: $('#email-view .subject').innerText,
		body: `On ${$('#email-view .timestamp').innerText} ${$('#email-view .from').innerText} wrote: "${$('#email-view .mailbody').innerText}"`
	};
	sub = sub.startsWith("Re: ") ? sub : "Re: " + sub
	compose_email(to, sub, body);
	return false;
}

let $ = q => document.querySelector(q)
let getmail = id => fetch("/emails/" + id)
	// .then(e => e.json())
	.catch(err => err).finally(log("Get mail function completed"))


let markasread = (mailID, read = true) => fetch('/emails/' + mailID, { method: 'PUT', body: JSON.stringify({ "read": read }) })
function markasarchived(mailID, archived = true, loadBox = "inbox") {
	fetch('/emails/' + mailID, { method: 'PUT', body: JSON.stringify({ "archived": archived }) })
		.then(e => { load_mailbox(loadBox); return e; });
}

let getView = view => $(`#${view}-view`)

async function mailview(mailid) {
	openView("email")
	getView("email").innerHTML = ""
	let mail = await getmail(mailid)
	if (!mail.ok)
		return getView("email").innerHTML = `<h3>Error : ${mail.statusText} [${mail.status}]</h3>`

	mail = await mail.json()

	getView("email").innerHTML = `<button class="archive" onclick="event.cancelBubble = true;markasarchived(${mail["id"]},${!mail.archived},'${mail.archived ? "inbox" : "archive"}');">${mail.archived ? "Una" : "A"}rchive</button><p class="from" id="emailsender">${mail.sender}</p><p class="to">${mail.recipients.join(", ")}</p><p class="subject" id="emailsub">${mail.subject}</p><p class="timestamp">${mail.timestamp}</p><button class="reply" onclick="replymail(this)">reply</button><hr><div class="mailbody">${mail.body}</div>`
	// <button onclick="com(sub=$('#emailsub').innerText,sender=$('#emailsender').innerText)">reply</button>
	markasread(mail.id)
}


function openView(view) {
	view = getView(view)
	if (!view)
		return false
	let views = ["emails", "compose", "email"]
	views
		.filter(e => getView(e))
		.forEach(e => getView(e).style.display = 'none')
	view.style.display = 'block'
	return true
}

function compose_email(to = "", sub = "", body = "") {

	// Show compose view and hide other views
	openView('compose');

	// Clear out composition fields
	$('#compose-recipients').value = to;
	$('#compose-subject').value = sub;
	$('#compose-body').value = body;
}

function sentMail(to, subject, body) {
	compose_email()
	$("#compose-view input[type=submit]").disabled = true
	$("#compose-view input[type=submit]").value = "... sending mail"
	fetch('/emails', {
		method: 'POST',
		body: JSON.stringify({
			recipients: to,
			subject: subject,
			body: body
		})
	})
		.then(response => {
			log(response);
			if (!response.ok)
				throw JSON.stringify([response.status, response.statusText, response])//todo remove
			return response.json()
		})
		.then(result => {
			// Print result
			// if (result[0]) {	
			// } else {
			// }
			log(result);
			alert(result.message);
			load_mailbox("sent")
			return result;
		}).catch(err => {
			console.error(err, to, subject, body)
			alert("Email not sent. Something problem")
			compose_email(to, subject, body)
			return err
		})
		.finally(() => {
			$("#compose-view input[type=submit]").disabled = false
			$("#compose-view input[type=submit]").value = "Send mail"
		});

}
async function fetchBox(box) {
	box = box.toLowerCase()
	if (!["inbox", "sent", "archive"].includes(box)) {
		//log("Outside of bounds");
		return { ok: false, message: "wrong parameters" };
	}
	switch (box) {
		case "inbox":
		case "sent":
		case "archive":
			let dat = await fetch(`/emails/${box}`)
				.then(response => response.json())
				.then(emails => {
					// Print emails
					//log(emails);
					return emails;
				});
			return dat;

		default:
			//log("Outside of bounds");
			return { ok: false, message: "wrong parameters" };
	}
}

async function load_mail(mailID) {
	let htmlText = await fetch(`/emails/` + mailID)
		.then(response => response.json())
		.then(email => {
			// Print email
			//log(email);
			return email;
		}).catch(err => console.error(err));

}

async function load_mailbox(mailbox, event = null) {
	log("loaded", mailbox);
	if (event)
		event.cancelBubble = false

	// Show the mailbox and hide other views
	openView('emails');

	// Show the mailbox name
	let htmlText = ""
	switch (mailbox) {
		case "inbox":
			htmlText += `<h3 class="center" >Inbox</h3>`;
			emails = await fetchBox("inbox")
			htmlText += emails.map(item => `<div class="mailbox">
				<div class="mail ${item.read ? 'read' : 'unread'}" onclick="mailview(${item["id"]})" data-mid="${item["id"]}">
					<div class="from">From: ${item["sender"]}</div>
					<div class="sub">${item["subject"]}<button class="archive" onclick="event.cancelBubble = true;markasarchived(${item["id"]},${!item.archived},'${mailbox}');">${item.archived ? "Una" : "A"}rchive</button></div>
					<div class="time">${item["timestamp"]}</div>
				</div>
			</div>`).join("\n")
			break;
		case "sent":
			htmlText += `<h3 class="center" >Sent</h3>`;
			emails = await fetchBox("sent")
			htmlText += emails.map(item => `<div class="mailbox">
				<div class="mail ${item.read ? 'read' : 'unread'}" onclick="mailview(${item["id"]})" data-mid="${item["id"]}">
					<div class="to">To: ${item["recipients"].join(", ")}</div>
					<div class="sub">${item["subject"]}</div>
					<div class="time">${item["timestamp"]}</div>
				</div>
			</div>`).join("\n")
			break;
		case "archive":
			htmlText += `<h3 class="center" >Archive</h3>`;
			emails = await fetchBox("archive")
			htmlText += emails.map(item => `<div class="mailbox">
					<div class="mail ${item.read ? 'read' : 'unread'}" onclick="mailview(${item["id"]})" data-mid="${item["id"]}">
						<div class="from">From: ${item["sender"]}</div>
						<div class="sub">${item["subject"]}<button class="archive" onclick="event.cancelBubble = true;markasarchived(${item["id"]},${!item.archived},'${mailbox}');">${item.archived ? "Una" : "A"}rchive</button></div>
						<div class="time">${item["timestamp"]}</div>
					</div>
				</div>`).join("\n")
			break;
		// case "inbox":
		//     htmlText += `<h3 class="center" >${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
		//   break;

		default:
			htmlText += `<h3 class="center" >Ex: - ${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
			break;
	}
	$('#view').innerHTML = htmlText;
} */