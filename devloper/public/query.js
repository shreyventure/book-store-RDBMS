const search = (str) => {
  axios
    .get(`/transactions/query?str=${str}`)
    .then(function (response) {
      // handle success
      console.log(response.data);
      const data = response.data;
      document.getElementById("transactions").innerHTML = "";

      for (let i = data.length - 1; i >= 0; i--) {
        const element = data[i];
        var d1 = document.createElement("div");
        var email = $("<p></p>").html(
          `<span class="lead text-success mr-4">Email:</span> ${element.userEmail}`
        );
        var sess = $("<li></li>").html(
          `<span class="lead mr-4 text-primary">Session ID:</span> ${element.sessid}`
        );
        var cust = $("<li></li>").html(
          `<span class="lead mr-4 text-primary">Customer ID:</span> ${element.custid}`
        );
        var amt = $("<li></li>").html(
          `<span class="lead mr-4 text-primary">Amount:</span> RS. ${element.amount}/-`
        );
        var bk = $("<li></li>").html(
          `<span class="lead mr-4 text-primary">Book ID:</span> ${element.bookid}`
        );
        var date = $("<li></li>").html(
          `<span class="lead mr-4 text-primary">Date:</span> ${element.date}`
        );
        var quan = $("<li></li>").html(
          `<span class="lead mr-4 text-primary">Quantity:</span> ${element.quantity}`
        );
        var btn = document.createElement("a");
        btn.href = `/transactions/update/${element.id}`;
        btn.innerHTML = "Mark as delivered";
        $(btn).addClass("btn btn-success float-right");
        $(email).append(btn);
        $(d1).addClass("card p-4");
        $(d1).append(email, sess, cust, amt, bk, quan, date);
        $("#transactions").append(d1);
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
};
