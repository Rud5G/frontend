with (scope('Search', 'App')) {
  define('perform', function(form_data) {
    var target_div = div(
      div({ style: "text-align: center; margin: 80px 0" },
        div('Searching... please wait.'),
        div(img({ src: 'images/spinner.gif' }))
      )
    );

    // reset homepage layout back to normal
    inner_html('before-content', '');
    show('before-content');
    show('content');

    render(
      breadcrumbs(
        a({ href: '#' }, 'Home'),
        'Search'
      ),

      target_div
    );

    BountySource.search(form_data.query, function(response) {
      var results = response.data||[];

      if (results.redirect_to) {
        set_route(results.redirect_to)
      } else if (results.create_issue) {
        set_route('#issues/new');
      } else {
        render({ into: target_div },

         results.trackers && div(
            h1('Trackers'),
            table(
              tr(
                th(),
                th('Name'),
                th({ style: 'width: 100%' }, 'Description')
              ),

              results.trackers.map(function(tracker) {
                return tr(
                  td(tracker.image_url && img({ src: tracker.image_url, style: 'width: 50px; height: 50px' })),
                  td(a({ href: tracker.frontend_path }, tracker.name)),
                  td(tracker.description)
                );
              })
            )
          ),

          results.issues && div(
            h1('Issues'),
            table(
              tr(
                th('Tracker'),
                th('Title'),
                th('Bounties')
              ),

              results.issues.map(function(issue) {
                return tr(
                  td(a({ href: issue.tracker.frontend_path }, issue.tracker.name)),
                  td(a({ href: issue.frontend_path }, issue.title)),
                  td(money(issue.bounty_total))
                );
              })
            )
          )

        );
      }

    });
  });
};