with (scope('Home', 'App')) {

  route('#not_found', function() {
    render(
      h1("Oops! That page wasn't found!"),
      p('If you know what you were expecting, please send us an email: ', a({ href: 'mailto:support@bountysource.com' }, 'support@bountysource.com'))
    );
  });

  route('#', function() {
    // render nothing, then hide the content for now... we're using before-content!!
    render('');
    hide('content');

    // reset variable
    define('page_state', { can_load_more_cards: true, current_cards: [] });

    render({ into: 'before-content' },
      section({ id: 'homepage' },

        div({ style: "background: #f2f3f2; border: 10px solid white; box-shadow: 0 0 5px #ccc8be; margin-bottom: 15px"},
          h1('The funding platform for open-source software.'),
          h2('Improve the open-source projects you love by creating and collecting bounties!'),
          get_started_actions(),
          div({ style: 'clear: both; border-top: 2px solid #e0ab45; margin: 10px' }),
          recent_people_div(),
          !logged_in() && sign_in_with_buttons()
        ),

        div({ id: 'column-container' }),
        div({ style: 'clear: both' }),
        div({ id: 'card-loader-div' }, 'Loading...')
      )
    );

    clear_cards();
    add_more_cards();
    check_scroll_to_see_if_we_need_more_cards();
  });

  // render the homepage box, which always has recent signups at the bottom
  define('recent_people_div', function() {
    var recent_people_div = div();
    BountySource.recent_people(function(response) {
      var recent_people = response.data;

      render({ into: recent_people_div },
        div({ style: "padding: 10px" },
          div({ style: 'color: #888; font-style: italic; margin-bottom: 5px' }, recent_people.total_count, " members have joined BountySource already!"),

          (recent_people.people||[]).map(function(person) {
            return div({ 'class': 'round-avatar' },
              a({ href: person.frontend_path }, img({ src: person.image_url }))
            );
          }),

          div({ style: 'clear: both' })
        )
      )
    });

    return recent_people_div;
  });

  define('card_filter_box', function() {
    return div({ id: 'cardfilterbox' },
      form({ name: 'filter', action: function(form_data) { filter_cards(form_data.text) } },
        text({name: 'text', placeholder: 'znc language:ruby min:$50' }),
        submit({ value: 'Filter', 'class': 'green' })
      )
    )
  });

  define('sign_in_with_buttons', function() {
    return div({ style: 'text-align: center; margin: 10px 0' },
      span({ style: 'font-size: 20px; color: #888; margin-right: 20px; font-style: italic' }, 'Sign in with...'),
      a({ 'class': "btn-auth btn-github large hover", style: 'margin-right: 20px', href: Github.auth_url() }, "GitHub"),
      a({ 'class': "btn-auth btn-facebook large", style: 'margin-right: 20px', href: Facebook.auth_url() }, "Facebook"),
      a({ 'class': "btn-auth btn-twitter large", style: 'margin-right: 20px', href: Twitter.auth_url() }, "Twitter"),
      a({ 'class': "btn-auth btn-email large", style: 'margin-right: 20px', href: '#signin/email' }, "Email Address")
      //div({ style: 'margin-bottom: 10px' }, a({ 'class': "btn-auth btn-google" }, "Sign in with Google"))
    );
  });


  define('get_started_actions', function() {
    return div({ style: 'text-align: center; padding: 0 0 20px 0;' },
      form({ style: 'display: inline', action: Search.perform },
        text({ name: 'query', style: 'width: 300px; line-height: 24px; padding: 0 15px; height: 40px; border: 1px solid #9dce5c;', placeholder: 'Issue URL, Project Name, Search Terms, etc.' }),
        submit({ value: 'Search', 'class': 'green', style: 'width: 80px; margin-left: 3px;' })
      )
    );
  });

  define('filter_cards', function(query) {
    // alert('query: ' + query);
    clear_cards();
    page_state.query = query;
    add_more_cards();
  });

  define('clear_cards', function() {
    // alert('clear cards');
    page_state.current_cards = [];
    page_state.can_load_more_cards = true;
    render({ into: 'column-container' },
      div({ 'class': 'card-column' }),
      div({ 'class': 'card-column' }),
      div({ 'class': 'card-column' }),
      div({ 'class': 'card-column' })
    );
  });

  define('add_more_cards', function() {
    if (!page_state.can_load_more_cards) return;

    show('card-loader-div');
    render({ into: 'card-loader-div'}, 'Loading...');


//    _gaq.push(['_trackEvent', 'Homepage', 'Show More Cards']);

    page_state.can_load_more_cards = false;
    BountySource.get_more_cards(page_state.current_cards, page_state.query, function(response) {
      var col_container = document.getElementById('column-container');
      if (!col_container) return;

      if (response.data.length == 0) {
        render({ into: 'card-loader-div' }, 'No results. Try broadening filter');
        return;
      }

      var j, target;
      for (j=0; j < response.data.fundraisers.length; j++) {
        var card = response.data.fundraisers[j];
        page_state.current_cards.push(card.card_id);

        target = col_container.childNodes[0];
        for (var k=1; k < col_container.childNodes.length; k++) {
          if (col_container.childNodes[k].clientHeight < target.clientHeight) target = col_container.childNodes[k];
        }

        target.appendChild(Fundraiser.fundraiser_card(card));
      }

//      for (j=0; j < response.data.repositories.length; j++) {
//        var card = response.data.repositories[j];
//        page_state.current_cards.push(card.card_id);
//
//        target = col_container.childNodes[0];
//        for (var k=1; k < col_container.childNodes.length; k++) {
//          if (col_container.childNodes[k].clientHeight < target.clientHeight) target = col_container.childNodes[k];
//        }
//
//        target.appendChild(Repository.repository_card(card));
//
//      }

      for (j=0; j < response.data.issues.length; j++) {
        var card = response.data.issues[j];
        page_state.current_cards.push(card.card_id);

        target = col_container.childNodes[0];
        for (var k=1; k < col_container.childNodes.length; k++) {
          if (col_container.childNodes[k].clientHeight < target.clientHeight) target = col_container.childNodes[k];
        }

        target.appendChild(Issue.issue_card(card));

      }

      hide('card-loader-div');

      // if we didn't get a full response, give up
      var card_count = response.data.fundraisers.length + response.data.issues.length;
      if (card_count >= 50) page_state.can_load_more_cards = true;
    });
  });


  define('check_scroll_to_see_if_we_need_more_cards', function() {
    if (get_route() != '#') return;

    var pageHeight = document.documentElement.scrollHeight;
    var clientHeight = document.documentElement.clientHeight;
    var scrollPos = document.documentElement.scrollTop || window.pageYOffset;
    if ((pageHeight - (scrollPos + clientHeight) < 100)) add_more_cards();

    setTimeout(check_scroll_to_see_if_we_need_more_cards, 500);
  });


  // route('#', function() {
  //   // render nothing, then hide the content for now... we're using before-content!!
  //   render('');
  //   hide('content');
  //
  //   var default_avatar_url = 'https://a248.e.akamai.net/assets.github.com/images/gravatars/gravatar-user-420.png';
  //
  //   var stats_container, leaderboard_container;
  //
  //   render({ into: 'before-content' },
  //     section({ id: 'homepage' },
  //
  //       div({ style: 'float: left; margin-right: 10px' },
  //
  //         div({ 'class': 'box' },
  //           div({ 'class': 'inner bigbox', style: 'width: 724px; height: 100px' },
  //             h1(span({ style: 'font-weight: bold' }, 'Bounty'), 'Source is a funding platform for open-source bugs and features.'),
  //             div({ 'class': 'h1-line'}, div()),
  //
  //             div({ 'class': 'begin-box' },
  //               div({ style: 'margin-left: 70px; margin-right: 40px; float: left; text-align: center; '},
  //                 a({ 'class': 'blue', style: 'width: 200px; display: block', href: '#bounties' }, 'Browse All Bounties')
  //               ),
  //               div({ style: 'font-size: 30px; line-height: 40px; float: left; padding: 0 5px'}, 'or'),
  //
  //               div({ style: 'width: 330px; float: left; text-align: center'},
  //                 form({ action: function(form_data) { set_route('#repos/search?query='+escape(form_data.query)) } },
  //                   text({ name: 'query', placeholder: 'Project Name' }),
  //                   submit({ value: 'Search', 'class': 'green', style: 'width: 80px; margin-left: 3px;' })
  //                 )
  //               )
  //             )
  //           )
  //         ),
  //
  //         div({ 'class': 'faq-box', style: 'margin-right: 10px' },
  //           div({ 'class': 'inner' },
  //             h1("BACKERS"),
  //             p("Want to help fund your favorite open-source projects?"),
  //             a({ 'class': 'gray', href: '#faq/backers' }, "Learn More")
  //           )
  //         ),
  //
  //         div({ 'class': 'faq-box', style: 'margin-right: 10px' },
  //           div({ 'class': 'inner' },
  //             h1("DEVELOPERS"),
  //             p("Want to earn money working on open-source projects?"),
  //             a({ 'class': 'gray', href: '#faq/developers' }, "Learn More")
  //           )
  //         ),
  //
  //         div({ 'class': 'faq-box' },
  //           div({ 'class': 'inner' },
  //             h1("COMMITTERS"),
  //             p("Are you a committer on an open-source projects?"),
  //             a({ 'class': 'gray', href: '#faq/committers' }, "Learn More")
  //           )
  //         ),
  //
  //         div({ style: 'clear: both' })
  //
  //         // div({ 'class': 'box', style: 'margin-top: 10px' },
  //         //   div({ 'class': 'inner bigbox', style: 'width: 694px' },
  //         //
  //         //
  //         //   )
  //         // )
  //       ),
  //
  //       div({ 'class': 'box', style: 'float: right' },
  //         stats_container=div({ 'class': 'inner stats', style: 'width: 120px; height: 278px' })
  //       ),
  //
  //       div({ style: 'clear: both; padding-bottom: 30px' }),
  //
  //       div({ 'class': 'box' },
  //         leaderboard_container=div({ 'class': 'inner leaderboard' })
  //       )
  //     )
  //   );
  //
  //   BountySource.overview(function(response) {
  //     var data = (response.data||{});
  //     render({ into: stats_container },
  //       h2(a({ href: '#bounties' }, money(data.total_unclaimed))),
  //       h3({ 'class': 'orange-line' }, a({ href: '#bounties' }, 'Active Bount' + (data.total_unclaimed == 1 ? 'y' : 'ies'))),
  //
  //       h2(a({ href: '#bounties' }, formatted_number(data.total_active_issues))),
  //       h3({ 'class': 'blue-line' }, a({ href: '#bounties' }, data.total_active_issues == 1 ? 'Issue with Bounty' : 'Issues with Bounties')),
  //
  //       h2(a({ href: '#bounties' }, formatted_number(data.total_bounties_created_this_month))),
  //       h3({ 'class': 'green-line' }, a({ href: '#bounties' }, 'Bount' + (data.total_bounties_created_this_month == 1 ? 'y' : 'ies') + ' This Month'))
  //     );
  //
  //     render({ into: leaderboard_container },
  //       section({ style: 'margin-right: 30px'},
  //         h2('Featured Projects'),
  //         ul(
  //           data.projects.featured.map(function(repo) {
  //             return li(img({ src: (repo.user.avatar_url),
  //                             style: 'width: 32px; height: 32px' }),
  //               a({ href: Repository.get_href(repo), style: 'color: #222' }, repo.display_name))
  //           })
  //         )
  //       ),
  //       section({ style: 'margin-right: 30px'},
  //         h2('Featured Fundraisers'),
  //         ul(
  //           data.fundraisers.featured.map(function(fundraiser) {
  //             return li(img({ src: (fundraiser.image_url),
  //               style: 'width: 32px; height: 32px' }),
  //               a({ href: Fundraiser.get_href(fundraiser), style: 'color: #222' }, fundraiser.title))
  //           })
  //         )
  //       ),
  //       section(
  //         h2('Top Backers and Developers'),
  //         ul(
  //           data.backers.most_total_bounties.map(function(backer) {
  //             return li(img({ src: backer.avatar_url, style: 'width: 32px; height: 32px' }), backer.display_name)
  //           })
  //         )
  //       ),
  //       div({ style: 'clear: both' })
  //     );
  //   })
  // });

}
