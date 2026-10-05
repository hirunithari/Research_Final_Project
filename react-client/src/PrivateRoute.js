// import React from "react";
// import { Route, Redirect } from "react-router-dom";
// import { AuthContext } from "./auth";

// function PrivateRoute({ component: RouteComponent, ...rest }) {
//   return (
//     <AuthContext.Consumer>
//       {({ currentUser }) => (
//         <Route
//           {...rest}
//           render={(routeProps) =>
//             !!currentUser ? (
//               <RouteComponent {...routeProps} />
//             ) : (
//               <Redirect to={"/login"} />
//             )
//           }
//         />
//       )}
//     </AuthContext.Consumer>
//   );
// }

// export default PrivateRoute;