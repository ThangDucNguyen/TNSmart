import React, { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import { injector } from 'tnsmart-core';
import { getHomepageSaga, getHomepageReducer ,useGetHomepage} from './core/usecases/getHomepage';



const HomePage: NextPage<any, any> = (props) => {
    const { request,fetch, response, loading } = useGetHomepage();

  useEffect(()=> {
    fetch()
  }, [])
  
  return (
    <div>
        HOMEPAGE
    </div>      
  );
};

HomePage.getInitialProps = async (
  ctx: any & { baseProps: any },
) => {
  return { orgId: 1 };
};

export default injector({
  sagas: [getHomepageSaga],
  reducers: [getHomepageReducer],
})(HomePage);
