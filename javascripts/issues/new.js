with (scope('Issue', 'App')) {

//  route('#issues/create', function() {
//    var target_div = div('Loading...');
//    var params = get_params();
//
//    render(
//
//      breadcrumbs(
//        a({ href: '#' }, "BountySource"),
//        "Create New Issue"
//      ),
//      target_div
//    );
//
//    BountySource.try_create_issue(params.url, function(response) {
//      var issue = response.data.issue;
//      var repository = response.data.repository;
//      if(issue) {
//        render({ into: target_div },
//          div('It looks like this issue already has a $' + issue.bounty_total + ' bounty on it. Would you like to add to the bounty?'),
//          div(
//            button({ 'class': 'blue', style: 'width: 100px', onClick: curry(set_route, get_href(issue) + '/bounties/new') }, 'Yes'),
//            button({ 'class': 'blue', style: 'width: 100px; margin-left: 5px;', onClick: curry(set_route, '#') }, 'No')
//          )
//        )
//      } else if(repository) {
//        render({ into: target_div },
//          div('The issue is new to us, but we recognize the project as ' + repository.display_name + '. Is that correct?'),
//          div(
//            button({ 'class': 'blue', style: 'width: 150px', onClick: curry(set_route, '#repos/'+ repository.full_name +'/issues/new?url=' + params.url) }, 'Yes, Add issue'),
//            button({ 'class': 'blue', style: 'width: 150px; margin-left: 5px;', onClick: alert("Working in progress ...") }, 'No, Add project')
//          )
//        )
//      } else {
//        // TODO
//      }
//    })
//  });

  route('#trackers/:tracker_id/issues/new', function(tracker_id) {
    var target_div = div('Loading...');
    var params = get_params();

    render(target_div);

    BountySource.get_repository_overview(tracker_id, function(response) {
      if (!response.meta.success) return render({ into: target_div }, response.data.error || response.data.message);

      var repo = response.data;

      render({into: target_div},
        breadcrumbs(
          a({ href: '#' }, 'Home'),
          a({ href: repo.frontend_path }, repo.name),
          a({ href: repo.frontend_path + '/issues' }, 'Issues'),
          'New'
        ),

        section({ style: 'padding: 21px' },
          form({ action: curry(add_issue, repo) },

            div({ id: 'create-issue-errors' }),

            div({ 'class': 'title' },
              label({ 'for': 'title-input' }, 'Title'),
              text({ name: 'title', id: 'title-input', value: '', placeholder: 'Issue Title' })
            ),

            div({ 'class': 'number' },
              label({ 'for': 'number-input' }, 'Number'),
              text({ name: 'number', id: 'number-input', value: '', placeholder: 'Issue Number' })
            ),

            div({ 'class': 'url' },
              label({ 'for': 'url-input' }, 'URL'),
              text({ name: 'url', id: 'url-input', value: '', placeholder: 'Issue URL' })
            ),

            submit({ 'class': 'blue' }, 'Create Issue')
          )
        )
      )
    });
  });

  define('add_issue', function(repo, form_data) {
    var issue_data = {
      title: form_data.title,
      number: form_data.number,
      url: form_data.url
    };

    BountySource.create_issue(
      issue_data,
      function(response) {
        var issue = response.data.issue;
        set_route(issue.frontend_url);
      },
      function(response) {
        render({ target: 'create-issue-errors' }, error_message(response));
      }
    );
  });

}
